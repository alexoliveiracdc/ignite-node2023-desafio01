import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'
import { url } from 'node:inspector'

const database = new Database()

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            let { search } = req.query


            if (search) {
                search = decodeURIComponent(search)
            }

            const tasks = database.select('tasks', {
                title: search,
                description: search,
            })

            return res.end(JSON.stringify(tasks))
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {

            const isBody = !!req.body
            if (!isBody) {

                return res.writeHead(400).end(
                    JSON.stringify({ message: 'Body in request is required' }),
                )
            }
            const { title, description } = req.body

            if (!title) {
                return res.writeHead(400).end(
                    JSON.stringify({ message: 'title is required' }),
                )
            }

            if (!description) {
                return res.writeHead(400).end(
                    JSON.stringify({ message: 'description is required' })
                )
            }

            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: new Date(),
                updated_at: new Date(),
            }

            database.insert('tasks', task)

            return res.writeHead(201).end()
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            const isBody = !!req.body
            if (!isBody) {

                return res.writeHead(400).end(
                    JSON.stringify({ message: 'Body in request is required' }),
                )
            }

            const { title, description } = req.body

            if (!title || !description) {
                return res.writeHead(400).end(
                    JSON.stringify({ message: 'Title or description are required' })
                )
            }

            const [task] = database.select('tasks', { id })

            if (!task) {
                return res.writeHead(404).end()
            }

            database.update('tasks', id, {
                title,
                description,
                updated_at: new Date()
            })

            return res.writeHead(204).end()
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            const [task] = database.select('tasks', { id })

            if (!task) {
                return res.writeHead(404).end()
            }

            database.delete('tasks', id)

            return res.writeHead(204).end()
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params

            const [task] = database.select('tasks', { id })

            if (!task) {
                return res.writeHead(404).end()
            }

            //Essa é uma maneira rápida de converter o resultado de uma expressão para um valor booleano
            const isTaskCompleted = !!task.completed_at

            // validar se  a task já foi completada, para não permitir atualizar duas vezes 
            if (isTaskCompleted) {
                return res.writeHead(400).end(
                    JSON.stringify({ message: 'Task has already been completed' })
                )
            }
            const completed_at = new Date()

            database.update('tasks', id, { completed_at })

            return res.writeHead(204).end()
        }
    }
]

