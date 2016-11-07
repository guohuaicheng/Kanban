;(function($, window, document, undefined) {

  var Kanban = function() {

  }

  Kanban.prototype = {
    createColumn: function() {
      return ""
    }
  };

  var WorkItem = function(options) {
    //this.create();
    this.create = function(options) {
      return $(
        "<li>" +
        "<div class='task' id='" + options.id + "'>" +
        "<div>" + options.name + "<a class='task-open'>Open</a></div>" +
        "<button class='ex'>Click to expand</button>" +
        "<div class='btnGroup'>" +
        "<button>ddddddddddd</button>" +
        "</div>" +
        "</div>" +
        "</li>"
      )
    }
  }

  //WorkItem.prototype = {
  //  create: function(options) {
  //    return $(
  //      "<li>" +
  //      "<div class='task' id='" + options.id + "'>" +
  //      "<div>" + options.name + "<a class='task-open'>Open</a></div>" +
  //      "<button class='ex'>Click to expand</button>" +
  //      "<div class='btnGroup'>" +
  //      "<button>ddddddddddd</button>" +
  //      "</div>" +
  //      "</div>" +
  //      "</li>"
  //    )
  //  }
  //}


  $.fn.kanban = function(options) {
    this.addClass("ui-kanban");
    var workItem = new WorkItem();
    if (options) {
      var _this = this;
      this.appendWorkItem = function(item) {
        var $column = $(".ui-kanban #" + item.columnId);
        if ($column.find(".item-create").length > 0) {
          $column.find(".item-create").before(workItem.create(item));
        } else {
          $(".ui-kanban #" + item.columnId).append(workItem.create(item));
        }
      };

      this.removeWorkItem = function(item) {
        var $item = $(".ui-kanban #" + item.columnId + " #" + item.id).parent();
        if ($item) {
          if (options && options.removeItemFn) {
            options.removeItemFn(item.id, function() {
              $item.remove();
            })
          } else {
            $item.remove();
          }
        }
      };

      this.updateWorkItem = function(item) {
        var $item = $(".ui-kanban #" + item.id);
        if ($item != null) {
          $(".ui-kanban #" + item.columnId).append($item);
        }
      };

      var newColumnId = null;
      for (var i = 0; i < options.columns.length; i++) {
        var column = options.columns[i];
        //var lis = "";
        //for (var j = 0; j < column.items.length; j++) {
        //  var item = column.items[j];
        //  lis += "<li id='" + item.id + "'><div class='task'></div></li>";
        //}

        //var columnEle = $("<div class='column'><h3>" + column.name + "</h3><ul class='tasks ui-sortable' id='" + column.id + "'>" + lis + "</ul></div>");
        var columnEle = $("<div class='column'><div class='content'><h3>" + column.name + "</h3><ul class='tasks ui-sortable' id='" + column.id + "'></ul></div></div>");
        this.append(columnEle);
        var $column = $("#" + column.id);
        for (var j = 0; j < column.items.length; j++) {
          var item = column.items[j];
          $column.append(workItem.create(item));
        }
        if (column.hasNew) {
          newColumnId = column.id;
          $column.append($("<div class='item-create'><span>+</span></div>"))
          $column.append($("<div class='item-new'><button id='item-add'>创建</button><button id='item-cancel'>取消</button></div>"));
        }
      }

      if (newColumnId) {
        $("#" + newColumnId + " .item-create").on("click", function() {
          $("#" + newColumnId + " .item-new").show(500);
          $(this).hide();
          return false;
        })

        $("#" + newColumnId + " .item-new #item-add").on("click", function() {

          if (options && options.itemAddFn) {
            options.itemAddFn({
              columnId: "first",
              id: Math.random(),
              name: Math.random()
            }, function(item) {
              _this.appendWorkItem(item)
              $("#" + newColumnId + " .item-new").hide();
              $("#" + newColumnId + " .item-create").show();
            })
          }


          return false;
        })

        $("#" + newColumnId + " .item-new #item-cancel").on("click", function() {
          $("#" + newColumnId + " .item-new").hide();
          $("#" + newColumnId + " .item-create").show();
          return false;
        })
      }
      $(".ui-kanban .ui-sortable").sortable({
        connectWith: [".ui-kanban .ui-sortable"], placeholder: "drop-area", items: 'li:not(.ui-state-disabled)'
      });

      $(".ui-kanban .ui-sortable").on("sortreceive", function(event, ui) {
        if (options && options.updateItemStatus) {
          options.updateItemStatus($(ui.item).children(".task").attr("id"), $(ui.item).parent().attr("id"))
        }
      });

      $(".ui-kanban .ui-sortable .task .task-open").on("click", function(e) {
        if (options.itemClickFn) {
          options.itemClickFn($(e.target).parent().parent().attr("id"));
        }
      })

      $(".ui-kanban").on("click", ".ui-sortable .task .ex", function(e) {
        $(this).parent().find(".btnGroup").toggle(500);
        return false;
      })
    }


    return this;
  }
})(jQuery, window, document);