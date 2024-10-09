import * as THREE from 'three'

import Game from '@/Game.js'
import View from '@/View/View.js'
import Debug from '@/Debug/Debug.js'
import State from '@/State/State.js'
import PlayerMaterial from './Materials/PlayerMaterial.js'

export default class Player
{
    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        this.view = View.getInstance()
        this.debug = Debug.getInstance()

        this.scene = this.view.scene

        this.setGroup()
        this.setHelper()
        this.setDebug()
    }

    setGroup()
    {
        this.group = new THREE.Group()
        this.scene.add(this.group)
    }
    
    setHelper()
    {
        this.helper = new THREE.Group()
        this.group.add(this.helper)

        // Car body
        const bodyGeometry = new THREE.BoxGeometry(2, 1, 4.5)
        bodyGeometry.translate(0, 0.6, 0)
        this.bodyMaterial = new PlayerMaterial()
        this.bodyMaterial.uniforms.uColor.value = new THREE.Color('#ff0000')
        this.bodyMaterial.uniforms.uSunPosition.value = new THREE.Vector3(- 0.5, - 0.5, - 0.5)
        const body = new THREE.Mesh(bodyGeometry, this.bodyMaterial)
        this.helper.add(body)

        // Car roof
        const roofGeometry = new THREE.BoxGeometry(1.8, 0.7, 2.5)
        roofGeometry.translate(0, 1.45, 0.5)
        const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 })
        const roof = new THREE.Mesh(roofGeometry, roofMaterial)
        this.helper.add(roof)

        // Windshield
        const windshieldGeometry = new THREE.PlaneGeometry(1.7, 0.8)
        windshieldGeometry.rotateX(Math.PI / 6)
        windshieldGeometry.translate(0, 1.3, 0.9)
        const windshieldMaterial = new THREE.MeshPhongMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.7 })
        const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial)
        this.helper.add(windshield)

        // Rear window
        const rearWindowGeometry = new THREE.PlaneGeometry(1.7, 0.8)
        rearWindowGeometry.rotateX(-Math.PI / 6)
        rearWindowGeometry.translate(0, 1.3, -1.9)
        const rearWindow = new THREE.Mesh(rearWindowGeometry, windshieldMaterial)
        this.helper.add(rearWindow)

        // Side windows
        const sideWindowGeometry = new THREE.PlaneGeometry(2, 0.7)
        sideWindowGeometry.rotateY(Math.PI / 2)
        const leftWindow = new THREE.Mesh(sideWindowGeometry, windshieldMaterial)
        leftWindow.position.set(-0.9, 1.3, 0.5)
        this.helper.add(leftWindow)
        const rightWindow = leftWindow.clone()
        rightWindow.position.x = 0.9
        this.helper.add(rightWindow)

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32)
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 })
        const tireMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a })

        const wheelPositions = [
            [-0.9, 0.4, 1.5],
            [0.9, 0.4, 1.5],
            [-0.9, 0.4, -1.5],
            [0.9, 0.4, -1.5]
        ]

        wheelPositions.forEach(position => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
            wheel.rotation.z = Math.PI / 2
            wheel.position.set(...position)
            this.helper.add(wheel)

            const tire = new THREE.Mesh(
                new THREE.TorusGeometry(0.4, 0.1, 16, 32),
                tireMaterial
            )
            tire.rotation.y = Math.PI / 2
            tire.position.set(...position)
            this.helper.add(tire)
        })

        // Headlights
        const headlightGeometry = new THREE.CircleGeometry(0.2, 32)
        const headlightMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, emissive: 0xFFFFFF })

        const headlightPositions = [
            [-0.7, 0.7, 2.25],
            [0.7, 0.7, 2.25]
        ]

        headlightPositions.forEach(position => {
            const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial)
            headlight.position.set(...position)
            this.helper.add(headlight)
        })

        // Taillights
        const taillightGeometry = new THREE.CircleGeometry(0.15, 32)
        const taillightMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000, emissive: 0xFF0000 })

        const taillightPositions = [
            [-0.7, 0.7, -2.25],
            [0.7, 0.7, -2.25]
        ]

        taillightPositions.forEach(position => {
            const taillight = new THREE.Mesh(taillightGeometry, taillightMaterial)
            taillight.position.set(...position)
            taillight.rotateY(Math.PI)
            this.helper.add(taillight)
        })

        // Grille
        const grilleGeometry = new THREE.PlaneGeometry(1.4, 0.4)
        const grilleMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 })
        const grille = new THREE.Mesh(grilleGeometry, grilleMaterial)
        grille.position.set(0, 0.5, 2.251)
        this.helper.add(grille)

        // Bumpers
        const bumperGeometry = new THREE.BoxGeometry(2, 0.2, 0.1)
        const bumperMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 })
        const frontBumper = new THREE.Mesh(bumperGeometry, bumperMaterial)
        frontBumper.position.set(0, 0.3, 2.25)
        this.helper.add(frontBumper)
        const rearBumper = frontBumper.clone()
        rearBumper.position.z = -2.25
        this.helper.add(rearBumper)
    }

    setDebug()
    {
        if(!this.debug.active)
            return

        const playerFolder = this.debug.ui.getFolder('view/player')
        playerFolder.addColor(this.bodyMaterial.uniforms.uColor, 'value')
    }


    update()
    {
        const playerState = this.state.player
        const sunState = this.state.sun

        this.group.position.set(
            playerState.position.current[0],
            playerState.position.current[1],
            playerState.position.current[2]
        )
        
        // Helper
        this.helper.rotation.y = playerState.rotation
        
        // Update sun position in the material
        if (this.bodyMaterial && this.bodyMaterial.uniforms) {
            this.bodyMaterial.uniforms.uSunPosition.value.set(sunState.position.x, sunState.position.y, sunState.position.z)
        }

        // Add car-specific updates if needed
        // For example, you might want to add wheel rotation based on movement
    }
}