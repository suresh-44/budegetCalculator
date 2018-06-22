var budgetController = (function(){

    var Expense = function(id, description, value){
           this.id = id;
           this.description = description;
           this.value  = value;
           this.percentage = -1
    }

    Expense.prototype.calcPercentage  = function(totalInc){

        if(totalInc > 0){
            this.percentage = Math.round((this.value/totalInc)*100)
        } else {
            this.percentage = -1
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage
    }

    var Income = function(id, description, value){
           this.id = id;
           this.description = description;
           this.value  = value;
    }

    var data = {
        allItem : {
            exp: [],
            inc: []
        },
        totals: {
            exp :0,
            inc :0
        },
        budget : 0,
        percentage : -1,
    }


    var calculateTotal = function(type){
        var sum =0 ;
        data.allItem[type].forEach(function(cur){
            sum += cur.value;
        })
        data.totals[type] = sum;

    }


    return {
        addItem : function(type, desc, val){
            var newItem, ID;
            // Creating new ID
            if (data.allItem[type].length > 0){
                 ID = data.allItem[type][data.allItem[type].length - 1].id + 1;
            } else {
                ID  = 0;
            }

            // Creating new item based on 'inc' or 'exp' type
            if(type === 'exp'){
                newItem= new Expense(ID, desc, val)
            } else if(type === 'inc'){
                newItem = new Income(ID, desc, val)
            }

            // push data into our data structure
            data.allItem[type].push(newItem)

            // Return the new Element
            return newItem

        },

        deleteItem : function(type, id) {
            var ids, index
            //id = 6
            // ids = [1,2,4,6,8,10]
            // index = 3

            ids = data.allItem[type].map(function(current){
                return current.id
            })

            index = ids.indexOf(id)

            if(index !== -1){
                data.allItem[type].splice(index, 1)
            }

        },

        calculateBudeget : function(){
            // Calculate total income and expenses
            calculateTotal('exp')
            calculateTotal('inc')

            // Calculate the budget : income - expense
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income tha we spent
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            } else {
                data.percentage = -1
            }

        },

        calculatePercentage : function(){
            /*
            a=10
            b=30
            c=40
            Income = 100
            a=10/100= 10%
            b = 30/100 = 30%
            c = 40/100 = 40%
            */

            data.allItem.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc)
            })
        },

        getPercentage : function(){
            var allperc = data.allItem.exp.map(function(current){
                return current.getPercentage()
            })

            return allperc
        },

        getBudget : function(){
            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage,
            }
        },

        testing : function(){
            console.log(data)
        }

    }
})()

var uiController = (function(){

    var DOMstring = {
        inputType : '.add__type',
        inputDesc : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetValue : '.budget__value',
        budgetIncome : '.budget__income--value',
        budgetExpense : '.budget__expenses--value',
        budgetPercentage : '.budget__expenses--percentage',
        container : '.container',
        expensesPercLabel : '.item__percentage',
        dateLabel : '.budget__title--month',
    }

    var formatNumber =  function(num, type){
            var numSplit, int, dec, type
            /*
                + or - before the number
                exactly 2 deceimal point
                comma separting the thousand
            */

            num = Math.abs(num)
            num = num.toFixed(2)

            numSplit = num.split('.')
            int = numSplit[0]

            if(int.length > 3) {
                int = int.substr(0, int.length-3) +  ',' + int.substr(int.length-3, 3)
            }

            dec = numSplit[1]

            return (type === 'exp' ? '-' : '+') + ' ' + int +'.'+ dec
    }

    var nodeListForEach = function(list, callback){
        for(let i =0; i<list.length; i++){
            callback(list[i], i)
        }
    }

    return {
        getInput : function(){
            return {
                type : document.querySelector(DOMstring.inputType).value, // will be either inc or exp
                description : document.querySelector(DOMstring.inputDesc).value,
                value : parseFloat(document.querySelector(DOMstring.inputValue).value)
            }
        },

        addLIstItem : function(obj, type){
            var html, newHtml, element;

          // Creating html String with placeholder percentage
            if(type === 'inc'){
              element = DOMstring.incomeContainer

               html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
           } else if (type === 'exp'){
              element = DOMstring.expensesContainer

              html =   '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
          }

          // Replacing the placeholder tag with actual data
          newHtml = html.replace('%id%', obj.id)
          newHtml = newHtml.replace('%description%', obj.description)
          newHtml = newHtml.replace('%value%',formatNumber(obj.value, type))

            // insert Html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },

        deleteListItem : function(selectorId){
            var ele = document.getElementById(selectorId)
            ele.parentNode.removeChild(ele)
        },

        clearFields : function(){
            var fields, fieldsarr;
            fields = document.querySelectorAll(DOMstring.inputDesc + ' , ' + DOMstring.inputValue)

            fieldsarr = Array.prototype.slice.call(fields)
            fieldsarr.forEach(function(current, index, array){
                current.value = '';
            })
            fieldsarr[0].focus()
        },

        addBudget : function(budget,inc, exp, percen){
            document.querySelector(DOMstring.budgetValue).textContent = formatNumber(budget, budget >= 0 ? 'inc' : 'exp')
            document.querySelector(DOMstring.budgetIncome).textContent = formatNumber(inc, 'inc')
            document.querySelector(DOMstring.budgetExpense).textContent = formatNumber(exp, 'exp')


            if (percen > 0) {
                document.querySelector(DOMstring.budgetPercentage).textContent = percen + '%'
            } else {
                document.querySelector(DOMstring.budgetPercentage).textContent = '---'
            }
        },

        displayPercentages : function(percentage){
                var fields = document.querySelectorAll(DOMstring.expensesPercLabel)

                nodeListForEach(fields, function(current, index){
                    if(percentage[index] > 0){
                        current.textContent = percentage[index] + ' %'
                    } else {
                        current.textContent = '---'
                    }

                })
        },

        displayMonth : function(){
            var now, year, month,  months

            now = new Date()

            year= now.getFullYear()
            month = now.getMonth()
            months= ['January', 'Febraury', 'March', 'April', 'May', 'June', 'July', 'Augest', 'September', 'October', 'November', 'Decmber']

            document.querySelector(DOMstring.dateLabel).textContent = months[month] + ' - ' + year

        },

        changeType : function(){

            var fields = document.querySelectorAll(
                DOMstring.inputType + ', ' +
                DOMstring.inputDesc + ', ' +
                DOMstring.inputValue
            )

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus')
            })

            document.querySelector(DOMstring.inputBtn).classList.toggle('red')

        },

        getDOMstring : function(){
            return DOMstring
        }
    }

})()

var controller = (function(budgetCtrl, uiCtrl){

    var setupEventListener = function(){
        var DOM = uiCtrl.getDOMstring();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem)

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which  === 13){
                ctrlAddItem()
            }
        })

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

        document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changeType)
    }

    var updateBudget = function(){
        // 1. Calculate the budget
        budgetCtrl.calculateBudeget()

        // 2.Return the budeget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the ui
        uiCtrl.addBudget(budget.budget, budget.totalInc, budget.totalExp, budget.percentage)
    }

    var updatePercentage = function(){
        // Calculate the item__percentage
        budgetCtrl.calculatePercentage()

        // read percentage from the budegetController
        var percentages = budgetCtrl.getPercentage()

        // update the ui eith new percentage
        uiCtrl.displayPercentages(percentages)
    }

    var ctrlAddItem = function(){
        var input, newItem;

        // 1. Get the filled input data
        input = uiCtrl.getInput()

        if (input.description !== "" && !isNaN(input.value) && input.value > 0){

            // 2. Add th item to the budgetController
            newItem = budgetCtrl.addItem(input.type, input.description, input.value)

            // 3. Add item to the ui
            uiCtrl.addLIstItem(newItem, input.type)

            // 4. Clear the fields
            uiCtrl.clearFields()

            //5. Calculate and update budget
            updateBudget()

            // 6. Calculate and update percentages
            updatePercentage()
        } else{
            alert('Please fill all the blanks....')
        }

    }

    var ctrlDeleteItem = function(event){
        var itemId, splitId, type, ID
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id
        if(itemId){
            //inc-1
            splitId = itemId.split('-')
            type = splitId[0]
            ID = parseInt(splitId[1])

            // 1. delete the item from the datastructre
            budgetCtrl.deleteItem(type, ID)

             // 2. Delete the item from the ui
             uiCtrl.deleteListItem(itemId)

             // 3.Update and show the new item
             updateBudget()

             // 4. Calculate and update percentages
             updatePercentage()
        }
    }

    return{
        init : function(){
            console.log('Applicaton is Started.')
            uiCtrl.displayMonth()
            uiCtrl.addBudget(0,0,0,-1)
            uiCtrl.clearFields()
            setupEventListener()
        }
    }
})(budgetController,uiController)

controller.init()
