import { vec3 } from 'gl-matrix'

import Game from '@/Game.js'
import State from '@/State/State.js'
import Camera from './Camera.js'

export default class Player
{
    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        this.time = this.state.time
        this.controls = this.state.controls

        this.rotation = 0
        this.inputSpeed = 10
        this.inputBoostSpeed = 30
        this.speed = 0

        this.position = {}
        this.position.current = vec3.fromValues(10, 0, 1)
        this.position.previous = vec3.clone(this.position.current)
        this.position.delta = vec3.create()

        this.camera = new Camera(this)

        this.gravity = 9.8 // Gravity acceleration (m/s^2)
        this.verticalVelocity = 0 // Initial vertical velocity
        this.isGrounded = false // Flag to check if the player is on the ground
    }

    update()
    {
        if(this.camera.mode === Camera.MODE_FLY)
        {
            // Update player position to match camera position when in fly mode
            vec3.copy(this.position.current, this.camera.fly.position)
            this.verticalVelocity = 0 // Reset vertical velocity in fly mode
            this.isGrounded = false
        }
        else
        {
            // Apply gravity
            if (!this.isGrounded) {
                this.verticalVelocity -= this.gravity * this.time.delta
            }

            // Calculate new position
            const newPosition = vec3.create()
            vec3.copy(newPosition, this.position.current)

            if (this.controls.keys.down.forward || this.controls.keys.down.backward || this.controls.keys.down.strafeLeft || this.controls.keys.down.strafeRight)
            {
                this.rotation = this.camera.thirdPerson.theta

                if(this.controls.keys.down.forward)
                {
                    if(this.controls.keys.down.strafeLeft)
                        this.rotation += Math.PI * 0.25
                    else if(this.controls.keys.down.strafeRight)
                        this.rotation -= Math.PI * 0.25
                }
                else if(this.controls.keys.down.backward)
                {
                    if(this.controls.keys.down.strafeLeft)
                        this.rotation += Math.PI * 0.75
                    else if(this.controls.keys.down.strafeRight)
                        this.rotation -= Math.PI * 0.75
                    else
                        this.rotation -= Math.PI
                }
                else if(this.controls.keys.down.strafeLeft)
                {
                    this.rotation += Math.PI * 0.5
                }
                else if(this.controls.keys.down.strafeRight)
                {
                    this.rotation -= Math.PI * 0.5
                }

                const speed = this.controls.keys.down.boost ? this.inputBoostSpeed : this.inputSpeed

                const x = Math.sin(this.rotation) * this.time.delta * speed
                const z = Math.cos(this.rotation) * this.time.delta * speed

                newPosition[0] -= x
                newPosition[2] -= z
            }

            // Apply vertical velocity
            newPosition[1] += this.verticalVelocity * this.time.delta

            // Check for terrain collision
            const chunks = this.state.chunks
            const elevation = chunks.getElevationForPosition(newPosition[0], newPosition[2])

            if (elevation !== undefined) {
                const minElevation = elevation + 1 // Add a small offset to prevent clipping
                if (newPosition[1] < minElevation) {
                    newPosition[1] = minElevation
                    this.verticalVelocity = 0
                    this.isGrounded = true
                } else {
                    this.isGrounded = false
                }
            } else {
                this.isGrounded = false
            }

            // Update position
            vec3.copy(this.position.current, newPosition)
        }

        vec3.sub(this.position.delta, this.position.current, this.position.previous)
        vec3.copy(this.position.previous, this.position.current)

        this.speed = vec3.len(this.position.delta)
        
        // Update view
        this.camera.update()

        // Update elevation (only when not in fly mode)
        if(this.camera.mode !== Camera.MODE_FLY)
        {
            const chunks = this.state.chunks
            const elevation = chunks.getElevationForPosition(this.position.current[0], this.position.current[2])

            if(elevation !== undefined)
                this.position.current[1] = Math.max(this.position.current[1], elevation + 1)
        }
    }

    jump()
    {
        if (this.isGrounded) {
            this.verticalVelocity = 5 // Adjust this value for desired jump height
            this.isGrounded = false
        }
    }
}