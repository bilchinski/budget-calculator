var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum = sum + current.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, desc, val) {
            var newItem, ID;

            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if(type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if(type === 'inc'){
                newItem = new Income(ID, desc, val);
            }
            data.allItems[type].push(newItem);
            return newItem;

        },

        deleteItem: function(type, id) {
            var ids,index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function () {
            calculateTotal('exp');
            calculateTotal('inc');
            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data);
        }
    };
})();

var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetMonth: '.budget__title--month',
        budgetValue: '.budget__value',
        incomeValue: '.budget__income--value',
        expensesValue: '.budget__expenses--value',
        percentageValue: '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage'
    };

    var formatNumber = function(num,type) {
        var numSplit, int, dec;
        num = Math.abs(num).toFixed(2);
        numSplit =  num.split('.');

        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) +
                ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    return {
      getinput: function () {
          return {
              type: document.querySelector(DOMstrings.inputType).value,
              description: document.querySelector(DOMstrings.inputDescription).value,
              value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
          };
      },

       addListItem: function(obj, type) {
          var html, newHtml,element;
          // Create HTML string with placeholder text
          if(type === 'inc') {
            element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"> ' +
                '<div class="item__description">%description%</div> ' +
                '<div class="right clearfix"> ' +
                '<div class="item__value">%value%</div> ' +
                '<div class="item__delete"> ' +
                '<button class="item__delete--btn"><i class="ion-ios-close-outline">' +
                '</i></button> ' +
                '</div> </div> </div>'
          } else if (type === 'exp') {
              element = DOMstrings.expensesContainer;
              html = '<div class="item clearfix" id="exp-%id%"> ' +
                '<div class="item__description">%description%</div>' +
                ' <div class="right clearfix"> ' +
                '<div class="item__value">%value%</div> ' +
                '<div class="item__percentage"></div> ' +
                '<div class="item__delete"> ' +
                '<button class="item__delete--btn"><i class="ion-ios-close-outline">' +
                  '</i></button> ' +
                '</div> </div> </div>'
          }

           newHtml = html.replace('%id%', obj.id);
           newHtml = newHtml.replace('%description%', obj.description);
           newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

           document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
       },

        deleteListItem: function(selectorID) {
          var element = document.getElementById(selectorID);
              element.parentNode.removeChild(element);
        },

        clearFields: function() {
          var fields, fieldsArr;
          fields = document.querySelectorAll(DOMstrings.inputDescription + ', '
              + DOMstrings.inputValue);

          fieldsArr = Array.prototype.slice.call(fields);
          fieldsArr.forEach(function (current, index, array) {
              current.value = "";
          })

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
          var type;
          obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetValue).textContent =  formatNumber(obj.budget, type) + '₪';
            document.querySelector(DOMstrings.incomeValue).textContent = formatNumber(obj.totalInc, 'inc') + '₪';
            document.querySelector(DOMstrings.expensesValue).textContent = formatNumber(obj.totalExp,'exp') + '₪';
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageValue).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageValue).textContent = '---';
            }
        },

        displayPercentages: function(percentageArr) {
          var fields = document.querySelectorAll(DOMstrings.itemPercentage);

          nodeListForEach(fields, function (cur, index) {
              if(percentageArr[index] !== -1) {
                  cur.textContent = percentageArr[index] + '%';
              } else {
                  cur.textContent = '---';
              }
          });


        },

      displayDate: function() {
        var now,year,month, months;
        now = new Date();
        year = now.getFullYear();
        month = now.getMonth();

        months = ['January', 'February', 'March', 'April','May','June','July',
        'August','September','October','November','December'];
        document.querySelector(DOMstrings.budgetMonth).textContent = months[month] + ' ' + year;
      },

       changedType: function() {
          var fields = document.querySelectorAll(
              DOMstrings.inputType + ',' +
              DOMstrings.inputDescription + ',' +
              DOMstrings.inputValue
          );

          nodeListForEach(fields, function (cur) {
              cur.classList.toggle('red-focus');
          })

           document.querySelector(DOMstrings.inputButton)
               .classList.toggle('red');
       },

      getDOMstrings: function () {
          return DOMstrings;
      }
    };

})();

var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        UICtrl.displayDate();
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if(event.key === 'Enter') {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }

    var updateBudget = function () {
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function () {
        budgetCtrl.calculatePercentages();
        var percentage = budgetCtrl.getPercentages();
        console.log(percentage);
        UICtrl.displayPercentages(percentage);
    }

    var ctrlAddItem = function() {

        var input, newItem;
        input = UICtrl.getinput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            UICtrl.addListItem(newItem,input.type);
            UICtrl.clearFields();
            updateBudget();
            updatePercentages();
        }
    };


    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            budgetCtrl.deleteItem(type,ID);
            UICtrl.deleteListItem(itemID);
            updateBudget();
            updatePercentages();
        }
    };

    return {
        init: function () {
            UICtrl.displayBudget(
                {budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1
                });
            setupEventListeners();

        }
    };

})(budgetController,UIController);

controller.init();
