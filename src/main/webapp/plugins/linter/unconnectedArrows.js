//Structure inspired from the webcola plugin
function unconnectedArrowsHelper(ui){
  //We need it
  this.graph = ui.editor.graph
  //In case we need it
  this.model = this.graph.model
  //We need it
  this.cells = this.model.cells
}
unconnectedArrowsHelper.prototype.detectUnconnectedArrows = function(){
  // console.log(this.cells)
  Object.values(this.cells).forEach(value => {
    //If it is an arrow/connection
    if(value.edge){
      //If there are lacking connections
      if(value.source === null || value.target === null){
        //Property that will be used to display text in the log or on hover
        value.message = "Arrow "+ value.mxObjectId +" lacks at least a connection";
        // console.log(value.message)

        //Style modification
        if(!value.oldColor){
          //New property to hold the previous non-erroring color
          value.oldColor = mxUtils.getValue(this.graph.getCellStyle(value), mxConstants.STYLE_STROKECOLOR, "defaultColor")
        }
        this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, "light-dark(#FF0000,#FF0000)", [value])

      //If both connections already exist
      } else {
        if(value.oldColor){
          this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, value.oldColor, [value])
          //Remove the unneeded property
          delete value.oldColor
        }
      }
    }
  })
  //Used to update the graph. Perhaps better methods exist, but this one works
  this.graph.refresh()
}