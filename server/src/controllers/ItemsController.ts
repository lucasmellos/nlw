import {Request, Response} from 'express'
import knex from '../database/connection'

class ItemsController {

    async  index(request: Request, response: Response){
        const Items = await knex('Items').select('*');

        const serializedItems = Items.map(item => {
            return {
                id: item.id,
                title: item.title,
                image_url: `http://localhost:3001/uploads/${item.image}`
            }
        })

        return response.json(serializedItems);
    }
}

export default ItemsController