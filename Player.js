class Player {
    constructor(x, y) {
        this.r = 50; // radius of the player
        this.body = Bodies.circle(x, y, this.r, { restitution: 0.8 });
        this.arm = createVector(x, y);
        this.armLength = 500;
        this.armGoal = createVector(x, y);
        this.armSpeed = 25;
        this.isLaunching = false;
        this.isConnected = false;
        this.constraint = null;
        this.attachmentPoint = null; // Store the original attachment point
        this.maxY = 0;
        World.add(world, this.body);
    }

    show() {
        //Draw the player
        const pos = this.body.position;
        push();
        fill(255);
        noStroke();
        ellipse(pos.x, pos.y, this.r * 2);
        pop();
        if (this.isLaunching) {
            //Draw the arm
            stroke(255);
            strokeWeight(5);
            line(this.body.position.x, this.body.position.y, this.arm.x, this.arm.y);
        }
        else if (this.isConnected) {
            //Draw the constraint
            stroke(255);
            strokeWeight(5);
            // Calculate rotated attachment point
            const platformPos = this.constraint.bodyB.position;
            const angle = this.constraint.bodyB.angle;
            const rotatedX = this.attachmentPoint.x * Math.cos(angle) - this.attachmentPoint.y * Math.sin(angle);
            const rotatedY = this.attachmentPoint.x * Math.sin(angle) + this.attachmentPoint.y * Math.cos(angle);
            const worldX = platformPos.x + rotatedX;
            const worldY = platformPos.y + rotatedY;
            line(this.body.position.x, this.body.position.y, worldX, worldY);
        }
    }

    update(platforms) {
        this.maxY = Math.max(this.maxY, this.body.position.y);
        
        // Update constraint point if connected to a rotating platform
        if (this.isConnected && this.constraint && this.attachmentPoint) {
            const platformPos = this.constraint.bodyB.position;
            const angle = this.constraint.bodyB.angle;
            const rotatedX = this.attachmentPoint.x * Math.cos(angle) - this.attachmentPoint.y * Math.sin(angle);
            const rotatedY = this.attachmentPoint.x * Math.sin(angle) + this.attachmentPoint.y * Math.cos(angle);
            this.constraint.pointB = { 
                x: rotatedX,
                y: rotatedY
            };
        }

        if (this.isLaunching) {
            // Calculate direction to goal
            let direction = createVector(this.armGoal.x - this.arm.x, this.armGoal.y - this.arm.y);
            
            // Move arm towards goal
            if (direction.mag() > this.armSpeed) {
                direction.normalize().mult(this.armSpeed);
                this.arm.add(direction);
            } else {
                // If we're very close to goal, snap to it
                this.arm.x = this.armGoal.x;
                this.arm.y = this.armGoal.y;
                this.isLaunching = false;
            }

            //Check if arm has collided with any platforms
            for (let platform of platforms) {
                if (platform.contains(this.arm.x, this.arm.y)) {
                    // Store the original attachment point relative to platform center
                    this.attachmentPoint = {
                        x: this.arm.x - platform.body.position.x,
                        y: this.arm.y - platform.body.position.y
                    };
                    
                    // Create a constraint between the player's body and the arm position
                    this.constraint = Constraint.create({
                        bodyA: this.body,
                        pointA: { x: 0, y: 0 },
                        bodyB: platform.body,
                        pointB: this.attachmentPoint,
                        stiffness: 0.005,  // Much lower stiffness for springiness
                        damping: 0.1,     // Lower damping to allow more oscillation
                        length: 100       // Longer resting length
                    });
                    World.add(world, this.constraint);
                    this.isLaunching = false;
                    this.isConnected = true;
                    break;
                }
            }
            // Check if arm has extended too far from player
            let distanceToPlayer = dist(this.body.position.x, this.body.position.y, this.arm.x, this.arm.y);
            if (distanceToPlayer > this.armLength) {
                this.isLaunching = false;
            }
        }
    }

    launch(x, y) {
        if (this.isConnected) {
            World.remove(world, this.constraint);
            this.constraint = null;
            this.attachmentPoint = null;
        }
        this.isConnected = false;
        this.isLaunching = true;
        this.arm.x = this.body.position.x;
        this.arm.y = this.body.position.y;
        this.armGoal.x = x;
        this.armGoal.y = y;
    }
} 