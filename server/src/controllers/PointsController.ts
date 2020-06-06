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
    
        const pointItens = items.map((iten_id: number) => {
            return {
                iten_id,
                point_id,
            }
        })
    
        await trx('point_itens').insert(pointItens);

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
        
        const itens = await knex('itens')
            .join('point_itens', 'itens.id', '=', 'point_itens.iten_id')
            .where('point_itens.point_id', id)
        return response.json({ points, itens})
        
    }

    async index(request: Request, response: Response){
        const { city, uf, itens } = request.query

        console.log(itens);
        const parsedItens = String(itens)
            .split(',')
            .map(iten => Number(iten.trim()))

        console.log(parsedItens);
        
        const points = await knex('points')
            .join('point_itens', 'points.id', '=', 'point_itens.point_id')
            .whereIn('point_itens.iten_id', parsedItens)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*')

        response.json(points)
    }
}

export default PointsController