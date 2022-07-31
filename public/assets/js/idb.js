// create variable to hold db connection
//Here, we create a variable db that will store the connected database 
//object when the connection is complete
let db;
// establish a connection to IndexedDB database called 'pizza_hunt' and 
//set it to version 1
//create the request variable to act as an event listener for the database
//As part of the browser's window object, indexedDB is a global variable. 
//Thus, we could say window.indexedDB, but there's no need to. 
//params: The name of the IndexedDB database you'd like to create 
//(if it doesn't exist) or connect to (if it does exist).
//The version of the database. By default, we start it at 1. This parameter 
//is used to determine whether the database's structure has changed between 
//connections. Think of it as if you were changing the columns of a SQL database.
const request = indexedDB.open('pizza_hunt', 1);

//In IndexedDB, the container that stores the data is called an object store. 
//We can't create an object store until the connection to the database is open, 
//emitting an event that the request variable will be able to capture. 
// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)

//The listener we just added will handle the event of a change that needs to be 
//made to the database's structure. IndexedDB infers that a change needs to be 
//made when the database is first connected (which we're doing now) or if the 
//version number changes.

//Thus, this onupgradeneeded event will emit the first time we run this code 
//and create the new_pizza object store. The event won't run again unless we 
//delete the database from the browser or we change the version number in 
//the .open() method to a value of 2, indicating that our database needs an update.

//When this event executes, we store a locally scoped connection to the database 
//and use the .createObjectStore() method to create the object store that will 
//hold the pizza data. With IndexedDB, we have a veritable blank slate—we'll 
//have to establish all of the rules for working with the database.

//For that reason, when we create the new_pizza object store, we also instruct 
//that store to have an auto incrementing index for each new set of data we 
//insert. Otherwise we'd have a hard time retrieving data.
request.onupgradeneeded = function (event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `new_pizza`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('new_pizza', { autoIncrement: true });
};

// upon a successful 
//With this first event handler, onsuccess, we set it up so that when we finalize 
//the connection to the database, we can store the resulting database object to 
//the global variable db we created earlier. This event will also emit every 
//time we interact with the database, so every time it runs we check to see if 
//the app is connected to the internet network.
request.onsuccess = function (event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;

    // check if app is online, if yes run uploadPizza() function to send all local db data to api
    if (navigator.onLine) {

        uploadPizza();
    }
};

request.onerror = function (event) {
    // log error here
    console.log(event.target.errorCode);
};

//With IndexedDB, we don't always have that direct connection like we do with SQL
// and MongoDB databases, so methods for performing CRUD operations with IndexedDB 
//aren't available at all times. Instead, we have to explicitly open a transaction,
// or a temporary connection to the database. This will help the IndexedDB 
//database maintain an accurate reading of the data it stores so that data isn't 
//in flux all the time.

//Once we open that transaction, we directly access the new_pizza object store, 
//because this is where we'll be adding data. Finally, we use the object store's 
//.add() method to insert data into the new_pizza object store.

//This saveRecord() function will be used in the add-pizza.js file's form 
//submission function if the fetch() function's .catch() method is executed.

// This function will be executed if we attempt to submit a new pizza and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    // access the object store for `new_pizza`
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    // add record to your store with add method
    pizzaObjectStore.add(record);
}

//With this uploadPizza() function, we open a new transaction to the database 
//to read the data. Then we access the object store for new_pizza and execute 
//the .getAll() method to it.

//Now, you may think that the getAll variable will automatically receive the 
//data from the new_pizza object store, but unfortunately it does not. Because 
//the object stores can be used for both small and large file storage, 
//the .getAll() method is an asynchronous function that we have to attach an 
//event handler to in order to retrieve the data. 
function uploadPizza() {
    // open a transaction on your db
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    // access your object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    // get all records from store and set to a variable
    const getAll = pizzaObjectStore.getAll();

    // upon a successful .getAll() execution, run this function
    //Now the getAll.onsuccess event will execute after the .getAll() method 
    //completes successfully. At that point, the getAll variable we created 
    //above it will have a .result property that's an array of all the data 
    //we retrieved from the new_pizza object store.

    //If there's data to send, we send that array of data we just retrieved 
    //to the server at the POST /api/pizzas endpoint. Fortunately, the 
    //Mongoose .create() method we use to create a pizza can handle either 
    //single objects or an array of objects, so no need to create another 
    //route and controller method to handle this one event.

    //On a successful server interaction, we'll access the object store one 
    //more time and empty it, as all of the data that was there is now in the 
    //database.
    getAll.onsuccess = function () {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // open one more transaction
                    const transaction = db.transaction(['new_pizza'], 'readwrite');
                    // access the new_pizza object store
                    const pizzaObjectStore = transaction.objectStore('new_pizza');
                    // clear all items in your store
                    pizzaObjectStore.clear();

                    alert('All saved pizza has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

// listen for app coming back online
//Here, we instruct the app to listen for the browser regaining internet 
//connection using the online event. If the browser comes back online, we 
//execute the uploadPizza() function automatically.
window.addEventListener('online', uploadPizza);