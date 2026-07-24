//tail -f ~/.xsession-errors


const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu; 
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;

const NO_MODEL_LOADED = "None";
const DEFAULT_LOAD_COMMAND_PREFIX = "llama serve -hf "


function MyApplet(metadata,orientation, panel_height, instance_id) {
    this._init(metadata,orientation, panel_height, instance_id);
}


MyApplet.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(metadata, orientation, panel_height, instance_id) {
        global.log("---Applettt loaded!");
        
        
        Applet.IconApplet.prototype._init.call(this, orientation, panel_height, instance_id);
        this.metadata = metadata;
        this.severStatus = 0;
        this.loadedModel = NO_MODEL_LOADED;
        this._updateApplet();
        
        this.menuManager = new PopupMenu.PopupMenuManager(this);
        this.menu = new Applet.AppletPopupMenu(this, orientation);
        this.menuManager.addMenu(this.menu);

    },

    _updateApplet() {
        
        if (this.severStatus == 0){
            this.set_applet_icon_path(this.metadata.path + "/icons/not-loaded.svg")
            //this.set_applet_label("");
            this.set_applet_tooltip("No model loaded.");
        }

        if( this.severStatus == 1 ) {
            this.set_applet_icon_path(this.metadata.path + "/icons/loading.svg")
            this.set_applet_tooltip("Loading model: _");
        }
        if(this.severStatus == -1) {
            this.set_applet_icon_path(this.metadata.path + "/icons/error.svg")
            this.set_applet_tooltip("Model encountered an error!");
        }
        if(this.severStatus == 2) {
            this.set_applet_icon_path(this.metadata.path + "/icons/loaded.svg")
            this.set_applet_tooltip("Model loaded: _");
        }
    },

    _loadModel(modelToLoad){
        global.log("---Load model:" + modelToLoad);
    },

    _convertFileNameToLoadCommand(filename){
        //llama serve -hf unsloth/gemma-4-E4B-it-qat-GGUF:UD-Q4_K_XL
        //models--google--gemma-4-E4B-it-qat-q4_0-gguf
        //
        return DEFAULT_LOAD_COMMAND_PREFIX + filename;
    },

    on_applet_clicked(event) {
        let path = '/home/dorinh/.cache/huggingface/hub';
        
        const directory = Gio.File.new_for_path(path);
        const iter =  directory.enumerate_children('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
        
        this.menu.removeAll();      
        
        for (const fileInfo of iter) {
            let modelToLoad = this._convertFileNameToLoadCommand(fileInfo.get_name());
            let menuItem = new PopupMenu.PopupMenuItem(modelToLoad); 

            if (this.loadedModel != modelToLoad)
                menuItem.connect("activate", Lang.bind(this, function () {
                this._loadModel(modelToLoad);
            }));

            this.menu.addMenuItem(menuItem);
        }
    
        this.menu.toggle(); 

        this.severStatus = -1;
        this._updateApplet();
    }
};


function main(metadata, orientation, panel_height, instance_id) {
    return new MyApplet(metadata, orientation, panel_height, instance_id);
}
