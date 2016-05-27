class Animation{
    public curr_frame: number = 0;
    public max_frame: number;
    public frame_count: number = 0;
    public frame_delay: number;
    public frame_width: number;
    public frame_height: number;
    public rel_ani_x: number;
    public rel_ani_y: number;
    public abs_ani_x: number = 0;
    public abs_ani_y: number = 0;

    public x_offset: number = 0;
    public y_offset: number = 0;
    public animation_end: boolean = false;
    public frame_change: boolean = false;
    public repeat: boolean = true;

    public constructor(max_frame, frame_delay, frame_width = 16, frame_height = 16, rel_ani_x = 0, rel_ani_y = 0){
    	this.max_frame = max_frame;
    	this.frame_delay = frame_delay;
    	this.frame_width = frame_width;
    	this.frame_height = frame_height;
    	this.rel_ani_x = rel_ani_x;
    	this.rel_ani_y = rel_ani_y;

    	this.Restart();
    }

    public Restart(){
    	this.curr_frame = 0;
    	this.frame_count = 0;
    	this.animation_end = false;
    	this.frame_change = false;
    }

    public Change(rax, ray, mf){
    	if (!(this.rel_ani_x == rax && this.rel_ani_y == ray && this.max_frame == mf)){
    		this.rel_ani_x = rax;
    		this.rel_ani_y = ray;
    		this.max_frame = mf;
    		this.Restart();
    	}
    }

    public Update(){
    	this.frame_change = false;
    	this.animation_end = false;

    	this.frame_count++;
    	if (this.frame_count >= this.frame_delay){
    		if (this.curr_frame < this.max_frame) this.curr_frame++;

    		if (this.curr_frame >= this.max_frame){
    			if (this.repeat)
    				this.curr_frame = 0;
    			else this.curr_frame = this.max_frame - 1;
    			this.animation_end = true;
    		}
    		this.frame_count = 0;
    		this.frame_change = true;
    	}
    }
}
