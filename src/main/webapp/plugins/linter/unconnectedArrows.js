function unconnectedArrowsHelper(ui){
  //In case we need it
  this.model = ui.editor.graph.model;
  //This we need
  this.cells = this.model.cells
}
unconnectedArrowsHelper.prototype.detectUnconnectedArrows = function(){
  console.log(this.cells)
  Object.values(this.cells).forEach(value => {
    if(!value.geometry){
      // console.log("This isn't a shape or an arrow")
      return;
    } else if (value.edge){
      // console.log("This is an arrow")
    } else {
      // console.log("This is a shape")
    }
  })
}