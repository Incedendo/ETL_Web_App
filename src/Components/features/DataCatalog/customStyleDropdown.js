// $(document).on("click", ".css-1pcexqc-container", function() {
//     console.log("clicking on dropdown");
//     var dropDown = $(".css-kj6f9i-menu ");
//     console.log(dropDown);
//     if(dropDown.length !== 0){
//         $(".dx-g-bs4-table-head")[0].style.zIndex = -1;
//         console.log("open dropdown");
//     }else{
//         $(".dx-g-bs4-table-head")[0].style.zIndex = 1;
//         console.log("close dropdown");
//     }
// });

$(document).on("click", function() {
    // console.log("clicking on dropdown");
    var dropDown = $(".css-kj6f9i-menu ");
    var header = $(".dx-g-bs4-table-head")[0];
    // var groupedColumn = $(".dx-g-bs4-cursor-pointer")[0];
    var groupedColumn = $(".dx-g-bs4-group-cell")[0];
    // console.log(dropDown);
    if(header !== undefined){
        if(dropDown.length !== 0){
            header.style.zIndex = -1;
            // console.log(groupedColumn);
            if(groupedColumn !== undefined){
                console.log("Group Col present");
                groupedColumn.style.zIndex = -1;
                // groupedColumn.style.background = 'red';
            }else{
                console.log("Group Col NOT present");
                // groupedColumn.style.zIndex = 0;
            }
            console.log("open dropdown");
        }else{
            header.style.zIndex = 1;
            if(groupedColumn !== undefined){
                console.log("Group Col NOT present");
                groupedColumn.style.zIndex = 0;
                // groupedColumn.style.background = 'blue';
            }
            // console.log("close dropdown");
        }

        
    }
    
});