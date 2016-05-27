class KeyManager{
	public keys_down = {};
	public keys_pressed = {};
	public keys_have_pressed = {};
	public keys_up = {};

    //KEY STATIC NAMES
    public static LEFT = 37;
    public static UP = 38;
    public static RIGHT = 39;
    public static DOWN = 40;
    public static ENTER = 13;
    public static SPACE = 32;
    public static SHIFT = 16;
    public static ESC = 27;
    public static H = 72;
    public static Q = 81;
    public static W = 87;
    public static E = 69;
    public static R = 82;
    public static U = 85;
    public static A = 65;
    public static S = 83;
    public static D = 68;
    public static X = 88;
    public static Z = 90;
    public static DEL = 46;

    public static NUMBERS = [49, 50, 51, 52, 53, 54, 55];


    public KeyDown(e){
    	if (level_edit_manager.typing) return;

    	this.keys_down[e.keyCode] = true;
    	if (!this.keys_have_pressed[e.keyCode]){
    		this.keys_pressed[e.keyCode] = true;
    		this.keys_have_pressed[e.keyCode] = true;
    	}

    	this.PreventArrowDefaults(e);
    }

    public KeyUp(e){
    	if (level_edit_manager.typing) return;

    	this.keys_up[e.keyCode] = true;

    	delete this.keys_down[e.keyCode];
    	delete this.keys_have_pressed[e.keyCode];
    	if (this.keys_pressed[e.keyCode]) delete this.keys_pressed[e.keyCode];
    	this.PreventArrowDefaults(e);
    }

    public ForgetKeysPressed(){
    	this.keys_pressed = {};
    	this.keys_up = {};
    }

    public PreventArrowDefaults(e){
    	if (level_edit_manager.typing) return;
    	switch(e.keyCode){
            case KeyManager.LEFT:
        	case KeyManager.UP:
        	case KeyManager.RIGHT:
        	case KeyManager.DOWN:
            case KeyManager.SPACE:
        		e.preventDefault();
        		break;
            default: break; // do not block other keys
        }
    }
}
