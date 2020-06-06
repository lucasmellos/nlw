import {Request, Response} from 'express'
import knex from '../database/connection'

class PointsController {
    async create(request: Request, response: Response){
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;
    
        const trx = await knex.transaction();
        
        const point = {
            image: 'image-fake',
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }

       const insertedId =  await trx('points').insert(point);
        
        const point_id = insertedId[0];

        const pointItems = items.map((item_id: number) => {
            return {
                item_id,
                point_id,
            }
        })
    
        await trx('point_items').insert(pointItems);

        await trx.commit()
    
        return response.json({
            id: point_id,
            ...point    
        });
    }

    async show(request: Request, response: Response){
        const { id } = request.params;

        const points = await knex('points').where('id', id).first();

        if (!points){
            return response.status(400).json({ message: 'Point not found' })
        }
        
        const Items = await knex('Items')
            .join('point_items', 'Items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
        return response.json({ points, Items})
        
    }

    async index(request: Request, response: Response){
        const { city, uf, Items } = request.query
        
        console.log(Items);
        const parsedItems = String(Items)
            .split(',')
            .map(item => Number(item.trim()))

        console.log(parsedItems);
        
        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*')

        response.json(points)
    }
}

export default PointsController