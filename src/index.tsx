import { serve } from 'bun'
import { Database } from 'bun:sqlite'
import { renderToReadableStream } from 'react-dom/server'
import { ToDo } from './components/ToDo'
import index from './index.html'
import Task from './Task'
import { clampOffset, defaultPageSize, makeNumber } from './utils'

const db = new Database(':memory:', { strict: true })

db.run(`
  CREATE TABLE task (
    id INTEGER NOT NULL PRIMARY KEY,
    note TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT FALSE,
    deleted INTEGER NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`)

const listTasksQuery = db.prepare(
  'SELECT * FROM task WHERE deleted=0 ORDER BY id DESC LIMIT $size OFFSET $offset'
)
const addTaskQuery = db.prepare('INSERT INTO task (note) VALUES ($note)')
const checkTaskQuery = db.prepare('UPDATE task SET done=1 WHERE id=$id')
const uncheckTaskQuery = db.prepare('UPDATE task SET done=0 WHERE id=$id')
const softDeleteTaskQuery = db.prepare('UPDATE task SET deleted=1 WHERE id=$id')
const countTasksQuery = db.prepare('SELECT COUNT(*) FROM task WHERE deleted=0')

const listTasks = (offset: number = 0, size: number = defaultPageSize) =>
  listTasksQuery.as(Task).all({ offset, size })
const addTask = (note: string) => addTaskQuery.run({ note })
const checkTask = (id: number) => checkTaskQuery.run({ id })
const uncheckTask = (id: number) => uncheckTaskQuery.run({ id })
const softDeleteTask = (id: number) => softDeleteTaskQuery.run({ id }).changes
const countTasks = () => (countTasksQuery.values()[0]?.[0] as number) ?? 0

// Prime the database
for (let i = 0; i < 20; i++) {
  addTask(`my note ${i + 1}`)
}

const outputElement = async (component: JSX.Element) => {
  const stream = await renderToReadableStream(component)
  return new Response(stream, { headers: { 'Content-Type': 'text/html' } })
}

const outputVoid = () => new Response('No Content', { status: 204 }) // No Swap
const outputEmpty = () => new Response('', { status: 200 }) // Empty Swap

const server = serve({
  routes: {
    '/': index,
    '/components/todo': {
      async GET(req) {
        const params = new URL(req.url).searchParams
        const total = countTasks()
        let offset = makeNumber(params.get('offset'), 0)
        offset = clampOffset(offset, total)

        return outputElement(<ToDo tasks={listTasks(offset)} offset={offset} total={total} />)
      },
    },
    '/components/todo!add': {
      async POST(req) {
        const data = await req.formData()
        const note = data.get('note')
        if (note) {
          addTask(note.toString())
          return outputElement(<ToDo tasks={listTasks()} total={countTasks()} />)
        }
        return outputVoid()
      },
    },
    '/components/todo!toggle': {
      async POST(req) {
        const data = await req.formData()
        const checked = data.get('checked')
        const id = data.get('id')
        if (id) {
          if (checked === 'on') {
            checkTask(Number(id))
          } else {
            uncheckTask(Number(id))
          }
        }
        return outputVoid()
      },
    },
    '/components/todo!delete': {
      async POST(req) {
        const data = await req.formData()
        const id = data.get('id')

        if (id) {
          softDeleteTask(Number(id))
        }

        const total = countTasks()
        let offset = makeNumber(data.get('offset'), 0)
        offset = clampOffset(offset, total)

        return outputElement(<ToDo tasks={listTasks(offset)} offset={offset} total={total} />)
      },
    },
  },

  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
})

console.log(`🚀 Server running at ${server.url}`)
