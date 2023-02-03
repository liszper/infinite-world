import GAME from '@/Game.js' 

class Chunks
{
    constructor()
    {
        this.world = new GAME.World()
        this.engine = new GAME.ENGINE.Engine()
        
        this.engine.chunks.on('create', (chunkEngine) =>
        {
            const chunk = new GAME.VIEW.Chunk(chunkEngine)

            chunkEngine.on('destroy', () =>
            {
                chunk.destroy()
            })
        })
    }

    update()
    {

    }
}

GAME.register('VIEW', 'Chunks', Chunks)
export default Chunks