import Task from '../Task'
import { Pager, prepareVal } from '../utils'

function ToDoItem({ task }: { task: Task }) {
  const vals = JSON.stringify({ id: task.id })
  return (
    <li hx-vals={vals}>
      <input
        type='checkbox'
        name='checked'
        checked={task.done}
        onChange={() => {}}
        hx-post='/components/todo!toggle'
        hx-target='this'
      />
      <label>{task.note}</label>
      <button hx-post='/components/todo!delete'>delete</button>
    </li>
  )
}

export function ToDo({
  tasks,
  total,
  offset = 0,
}: {
  tasks: Task[]
  total: number
  offset?: number
}) {
  const pager = Pager(offset, total)
  const makeOffsetVal = prepareVal('offset', pager.computeOffset)

  return (
    <div hx-target='this' hx-swap='outerHTML' hx-vals={makeOffsetVal(pager.actualPage)}>
      <p>ToDo App</p>
      <input
        hx-post='/components/todo!add'
        hx-trigger='keyup[keyCode==13]'
        name='note'
        type='text'
      />
      <ul>
        {tasks.map(t => (
          <ToDoItem key={`task-${t.id}`} task={t} />
        ))}
      </ul>
      {pager.pages.map((active, i) => (
        <button
          key={`page-${i}`}
          disabled={active}
          hx-get='/components/todo'
          hx-vals={makeOffsetVal(i)}
        >
          {i + 1}
        </button>
      ))}
    </div>
  )
}
