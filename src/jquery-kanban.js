(function(factory) {
  if (typeof define === "function" && define.amd) {

    // AMD. Register as an anonymous module.
    define(["jquery", 'jquery-ui'], factory);
  } else {

    // Browser globals
    factory(jQuery);
  }
}(function($) {

  var Kanban = function(element, options) {
    this.$element = $(element);
    this.$element.addClass("ui-kanban");
    this.options = options;
    this.newColumnId = null;
    this.cardContainers = {};
    this._init();
    this._bindEvents();
  };

  Kanban.prototype = {

    _createColumn: function(column) {
      return $(
        "<div class='column'>" +
        "<div class='content'>" +
        "<h3>" + column.name + "</h3>" +
        "<ul class='cards ui-sortable' id='" + column.id + "'></ul>" +
        "</div>" +
        "</div>");
    },

    _createCard: function(card) {
      return $(
        "<li id='" + card.id + "'>" +
        "<div class='card'>" +
        "<div>" + card.name + "<a class='card-open'>Open</a></div>" +
        "<button class='ex'>Click to expand</button>" +
        "<div class='btnGroup'>" +
        "<button>ddddddddddd</button>" +
        "</div>" +
        "</div>" +
        "</li>"
      )
    },

    _init: function() {
      this.$element.html("");
      if (this.options && this.options.columns && this.options.columns.length > 0) { //create initial columns and cards
        for (var i = 0; i < this.options.columns.length; i++) {
          var column = this.options.columns[i];
          var $columnEle = this._createColumn(column);
          this.$element.append($columnEle);

          var $cardsContainer = $columnEle.find("ul");
          this.cardContainers[column.id] = $cardsContainer;
          if (column.cards && column.cards.length > 0) {
            for (var j = 0; j < column.cards.length; j++) {
              var card = column.cards[j];
              $cardsContainer.append(this._createCard(card));
            }
          }

          if (column.hasNew) {
            this.newColumnId = column.id;
            $cardsContainer.append($("<div class='card-create'><span>+</span></div>"))
            $cardsContainer.append($("<div class='card-new'><button id='card-add'>创建</button><button id='card-cancel'>取消</button></div>"));
          }
        }

        $(".ui-kanban .ui-sortable").sortable({
          connectWith: [".ui-kanban .ui-sortable"], placeholder: "drop-area", items: 'li:not(.ui-state-disabled)'
        });
      }

    },

    _bindMethod: function(fn) {
      /**
       * Bind prototype method to instance scope (similar to CoffeeScript's fat
       * arrow)
       */
      var that = this;
      return function() {
        return fn.apply(that, arguments);
      };
    },

    _bindEvents: function() {

      $(".ui-kanban .ui-sortable").sortable({
        connectWith: [".ui-kanban .ui-sortable"], placeholder: "drop-area", items: 'li:not(.ui-state-disabled)',cancel:".card-open"
      });

      this._sortReceive = this._bindMethod(this._sortReceive);
      $(".ui-kanban .ui-sortable").on("sortreceive", this._sortReceive);

      this._openCard = this._bindMethod(this._openCard);
      $(".ui-kanban").on("click", ".ui-sortable .card .card-open", this._openCard);

      $(".ui-kanban").on("click", ".ui-sortable .card .ex", function(e) {
        $(this).parent().find(".btnGroup").toggle(500);
        return false;
      })
      var _this = this;
      if (_this.newColumnId) {
        $("#" + _this.newColumnId + " .card-create").on("click", function() {
          $("#" + _this.newColumnId + " .card-new").show(500);
          $(this).hide();
          return false;
        })



        $("#" + _this.newColumnId + " .card-new #card-add").on("click", function() {
          if (typeof _this.options.cardAddFn == "function") {
            _this.options.cardAddFn({
              columnId: "first",
              id: Math.random(),
              name: Math.random()
            }, function(card) {
              _this.appendCard(card)
              $("#" + _this.newColumnId + " .card-new").hide();
              $("#" + _this.newColumnId + " .card-create").show();
            })
          }
          return false;
        })

        $("#" + _this.newColumnId + " .card-new #card-cancel").on("click", function() {
          $("#" + _this.newColumnId + " .card-new").hide();
          $("#" + _this.newColumnId + " .card-create").show();
          return false;
        })
      }
    },

    _unbindEvents: function() {
      $(".ui-kanban .ui-sortable").off("sortreceive", this._sortReceive);
      $(".ui-kanban .ui-sortable .card .card-open").off("click", this._openCard);
      if(this.newColumnId) {
        $("#" + this.newColumnId + " .card-create").off("click");
        $("#" + this.newColumnId + " .card-new #card-add").off("click");
        $("#" + this.newColumnId + " .card-new #card-cancel").off("click");
      }
    },

    _sortReceive: function(event, ui) {
      if (typeof this.options.updateCardStatus == "function") {
        this.options.updateCardStatus($(ui.item).children(".card").attr("id"), $(ui.item).parent().attr("id"))
      }
    },

    _openCard: function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (this.options.cardClickFn) {
        this.options.cardClickFn($(e.target).parent().parent().parent().attr("id"));
      }
    },

    appendCard: function(card) {
      var $cardContainer = this.cardContainers[card.columnId];
      if ($cardContainer.find(".card-create").length > 0) {
        $cardContainer.find(".card-create").before(this._createCard(card));
      } else {
        $cardContainer.append(this._createCard(card));
      }
    },

    removeCard: function(card) {
      var $card = this.cardContainers[card.columnId].find("#"+ card.id);
      if ($card) {
        if (typeof this.options.cardRemoveFn == "function") {
          this.options.cardRemoveFn(card.id, function() {
            $card.remove();
          })
        } else {
          $card.remove();
        }
      }
    },

    updateCard: function(card) {
      var $card = $(".ui-kanban #" + card.id);
      var $cardContainer = this.cardContainers[card.columnId];
      if ($card.length > 0 && $cardContainer) {
        if ($cardContainer.find(".card-create").length > 0) {
          $cardContainer.find(".card-create").before($card);
        } else {
          $cardContainer.append($card);
        }
      }
    },

    refresh: function(options) {
      this.options = options;
      this.newColumnId = null;
      this.cardContainers = {};
      this._init();
    },

    destroy: function() {
      this._unbindEvents();
      this.$element.html("");
      this.cardContainers = {};
      this.newColumnId = null;
    }
  }

  $.fn.kanban = function(options) {

    var instance,
      method,
      args;
    if (typeof(options) == 'string') {
      method = options;
      args = Array.prototype.slice.call(arguments, 1);
    }
    this.each(function() {
      instance = $(this).data('_kanban');
      // The plugin call be called with no method on an existing GridList
      // instance to re-initialize it
      if (instance && !method) {
        instance.destroy();
        instance = null;
      }
      if (!instance) {
        instance = new Kanban(this, options);
        $(this).data('_kanban', instance);
      }
      if (method) {
        instance[method].apply(instance, args);
      }
    });
    // Maintain jQuery chain
    return this;
  }
}));