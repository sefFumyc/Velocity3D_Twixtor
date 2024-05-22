function AddVelo(thisObj)
{
    var name = "velo_to_blender";
    var version = "v1.0";
    var gmzScript = 'velo = effect("velocity")("Slider");\
    ofs = effect("offset")("Slider");\
    n = velo.numKeys;\
    if (n > 0 && velo.key(1).time < time)\
    {\
        clc = velo.key(1).value*(velo.key(1).time - inPoint);\
        for (i = 2; i <= n; i++)\
        {\
            if (velo.key(i).time > time) break;\
            k1 = velo.key(i-1);\
            k2 = velo.key(i);\
            v2 = velo.valueAtTime(k2.time-.001);\
            clc += (k1.value + v2)*(k2.time - k1.time)/2;\
        }\
        clc += (velo.value + velo.key(i-1).value)*(time - velo.key(i-1).time)/2;\
    }\
    else\
    {\
        clc = velo.value*(time - inPoint);\
    }\
    ((value + clc)/100+ofs/1000);\
    //youtube.com/gmzorz';

    function buildUI(thisObj)
    {
        var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", name + " " + version, undefined, {resizeable:true});
        
        res = "group\
            {\
                orientation:'column',  alignment:['fill','center'], alignChildren:['fill','fill'],\
                groupZero: Group\
                {\
                    orientation:'column', alignChildren:['fill','center'],\
                    buttonAdd: Button{text: 'Add Velocity'},\
                    buttonOutput: Button{text: 'Output Result'}\
                }\
                groupOne: Group\
                {\
                    orientation:'column',\
                    staticText1: StaticText{text: 'Expression: youtube.com/gmzorz'},\
                    staticText2: StaticText{text: 'UI script: youtube.com/1suky1'},\
					staticText3: StaticText{text: 'Export Code: Lukky'},\
                }\
            }";
        
        myPanel.grp = myPanel.add(res);

        myPanel.layout.layout(true);
        myPanel.grp.minimumSize = myPanel.grp.size;
        
        myPanel.layout.resize();
        myPanel.onResizing = myPanel.onResize = function()
        {
            this.layout.resize();
        }

        myPanel.grp.groupZero.buttonAdd.onClick = function()
        {
            AddVeloToLayer();
        }

        myPanel.grp.groupZero.buttonOutput.onClick = function()
        {
            OutputVeloResult();
        }

        myPanel.layout.layout(true);
        return myPanel;    
    }

    function AddVeloToLayer()
    {
        app.beginUndoGroup("Adding Velocity");

        var layers = app.project.activeItem.selectedLayers;

        for(var i = 0; i < layers.length; i++)
        {
            var slider1 = layers[i].Effects.addProperty("Slider Control");
            slider1.name = "velocity"; 
            slider1.property("Slider").setValue(100);
            var slider2 = layers[i].Effects.addProperty("Slider Control");
            slider2.name = "offset";

            layers[i].timeRemapEnabled = true;
            var timeRemap = layers[i].property("Time Remap");
            if(timeRemap.canSetExpression)
            {
                timeRemap.expression = gmzScript;
            }
        }

        app.endUndoGroup();
    }

    function OutputVeloResult()
    {
        var activeComp = app.project.activeItem;
        var layers = app.project.activeItem.selectedLayers;

        if(canWriteFiles())
        {
            if (layers.length > 0)
            {
                var path = new File("My Sync").saveDlg(["Save Velo"],["VELO Files:*.velo"]);    
                
                var selected_layer = layers[0]
                var start_frame = selected_layer.inPoint * activeComp.frameRate
                var end_frame = selected_layer.outPoint * activeComp.frameRate

                var json = "{\r\n"
                
                for (var i = start_frame; i < end_frame; i++)
                {
						
				var current_time = i / activeComp.frameRate
                var timeRemap = app.project.activeItem.selectedLayers[0]("ADBE Time Remapping");
                var comp = app.project.activeItem;
				comp.time = current_time;
				var expressionResult = Math.floor(timeRemap.value * selected_layer.source.frameRate);
				//*selected_layer.source.frameRate




				
						
               
                //var time = selected_layer.property("timeRemap").valueAtTime(current_time, true)
                //var frame = Math.floor(time * selected_layer.source.frameRate)
                json = json + "\t\"" + i + "\": " + expressionResult
                if(i < end_frame-1){
                    json += ",\r\n"
                    }
                
                }

                json += "\r\n}"

                writeFile(path, json)
            }
            else
            {
                alert ("No layers selected.");
            }
        }
    }

    function writeFile(fileObj, fileContent, encoding) {

        encoding = encoding || "utf-8";
        fileObj = (fileObj instanceof File) ? fileObj : new File(fileObj);
        var parentFolder = fileObj.parent;
        if (!parentFolder.exists && !parentFolder.create())
            throw new Error("Cannot create file in path " + fileObj.fsName);
            
        fileObj.encoding = encoding;
        fileObj.open("w");
        fileObj.write(fileContent);
        fileObj.close();
        return fileObj;
    }

    function canWriteFiles() {

        if (isSecurityPrefSet()) return true;

        alert(script.name + " requires access to write files.\n" +

            "Go to the \"General\" panel of the application preferences and make sure " +

            "\"Allow Scripts to Write Files and Access Network\" is checked.");

        app.executeCommand(2359);

        return isSecurityPrefSet();

        function isSecurityPrefSet() {

            return app.preferences.getPrefAsLong(

                "Main Pref Section",

                "Pref_SCRIPTING_FILE_NETWORK_SECURITY"

            ) === 1;

        }
    }

    var myScriptPal = buildUI(thisObj);
   
    if((myScriptPal != null) && (myScriptPal instanceof Window))
    {
        myScriptPal.center();
        myScriptPal.show();
    }   
    
    if(this instanceof Panel)
        myScriptPal.show();  
}

AddVelo(this);
