window.onload = init;

let url = "http://127.0.0.1:8080/SimpleLibrarySpring/dashboard";

var username
var password

function init() {
    if (document.cookie.match(/^(.*;)?\s*JSESSIONID\s*=\s*[^;]+(.*)?$/) != null) {
        ShowDashboard();
    }
    else {
        HideDashboard();
    }
}

async function Login() {
    var formData = new FormData(document.getElementById('loginForm'));
    this.username = formData.get("Username");
    this.password = formData.get("Password");
    await FillBooksTable();
}

async function FillBooksTable() {
    try {
        var books = await GetBooks(this.username, this.password)
        var booksJson = JSON.parse(books);
        FillTable(booksJson.data);
        ShowDashboard();
    }
    catch (err) {
        console.log("Error: " + err);
        alert("Wrong login or password!");
    }
}

function ShowDashboard() {
    document.getElementById("dashboard").style.display = 'block';
    document.getElementById("login").style.display = "none";
    document.title = "Dashboard";
}

async function Logout() {
    document.cookie = "JSESSIONID=;expires=" + new Date(0).toUTCString();
    HideDashboard();
}

function HideDashboard() {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("login").style.display = "block";
    document.title = "Login";
}

async function GetBooks() {
    var authorizationBasic = "Basic " + window.btoa(this.username + ':' + this.password);
    var request = new XMLHttpRequest();
    return new Promise(function (resolve, reject) {
        request.open("GET", url, true);
        request.setRequestHeader("Authorization", authorizationBasic);
        request.onreadystatechange = function () {
            if (this.readyState == 4) {
                switch (this.status) {
                    case 200:
                        resolve(this.responseText);
                    default:
                        reject("Status: " + this.status + ", Response: " + this.responseText + ", State: " + this.readyState);
                }
            }
        }
        request.send();
    });
}

function FillTable(books) {
    var table = document.getElementById("booksTable");
    books.forEach(book => {
        var row = table.insertRow();
        var title = row.insertCell(0);
        title.innerHTML = book.title;
        var author = row.insertCell(1);
        author.innerHTML = book.author;
        var year = row.insertCell(2);
        year.innerHTML = book.year;
    });
}

function CleanTable() {
    var table = document.getElementById("booksTable");
    table.innerHTML = "";
}

async function AddBook() {
    var formData = new FormData(document.getElementById('addForm'));
    var title = formData.get("TitleOfBookToAdd");
    var author = formData.get("AuthorOfBookToAdd");
    var year = formData.get("YearOfBookToAdd");
    console.log(title +" "+author+" "+year);
    try {
        await AddBookRequest(title, author, year)
        CleanTable();
        await FillBooksTable()
    }
    catch (err) {
        alert(err);
    }
}

async function RemoveBook() {
    var formData = new FormData(document.getElementById("removeForm"));
    var id = formData.get("IdOfBookToRemove");
    console.log(id);
    try {
        await RemoveBookRequest(id)
        CleanTable();
        await FillBooksTable()
    }
    catch (err) {
        alert(err);
    }
}

async function AddBookRequest(title, author, year) {
    console.log(title +" "+author+" "+year);
    var authorizationBasic = "Basic " + window.btoa(this.username + ':' + this.password);
    var request = new XMLHttpRequest();
    return new Promise(function (resolve, reject) {
        request.open("POST", url, true);
        request.setRequestHeader("Authorization", authorizationBasic);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.onreadystatechange = function () {
            if (this.readyState == 4) {
                switch (this.status) {
                    case 200:
                        resolve();
                    case 401:
                    case 403:
                        reject("You are not authorized to add book");
                    default:
                        reject("Unable to add book");
                }
            }
        }
        request.send('{"title" : "'+title+'","author": "'+author+'","year": "'+year+'"}');
    });
}

async function RemoveBookRequest(id) {
    console.log(id);
    var authorizationBasic = "Basic " + window.btoa(this.username + ':' + this.password);
    var request = new XMLHttpRequest();
    return new Promise(function (resolve, reject) {
        request.open("DELETE", url+"/"+id, true);
        request.setRequestHeader("Authorization", authorizationBasic);
        request.onreadystatechange = function () {
            if (this.readyState == 4) {
                switch (this.status) {
                    case 200:
                        resolve();
                    case 401:
                    case 403:
                        reject("You are not authorized to remove book");
                    default:
                        reject("Unable to remove book");
                }
            }
        }
        request.send();
    });
}

