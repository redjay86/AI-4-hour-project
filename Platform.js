class Platform {
    constructor(x, y, w, h, angle = 0) {
        this.w = w;
        this.h = h;
        this.body = Bodies.rectangle(x, y, w, h, {
            isStatic: true
        });
        Body.rotate(this.body, angle);
        World.add(world, this.body);
    }

    contains(x, y) {
        const bodies = Query.point([this.body], { x: x, y: y });
        return bodies.length > 0;
    }

    show() {
        const pos = this.body.position;
        push();
        fill(100);
        noStroke();
        rectMode(CENTER);
        rect(pos.x, pos.y, this.w, this.h);
        pop();
    }

    update() {
        if (this instanceof SpinningPlatform) {
            Body.rotate(this.body, this.angularSpeed);
        }
    }
}

class SpinningPlatform extends Platform {
    constructor(x, y, w, h, angularSpeed) {
        super(x, y, w, h);
        this.angularSpeed = angularSpeed;
    }

    

    show() {
        const pos = this.body.position;
        const angle = this.body.angle;
        push();
        translate(pos.x, pos.y);
        rotate(angle);
        fill(100);
        noStroke();
        rectMode(CENTER);
        rect(0, 0, this.w, this.h);
        pop();
    }
} 