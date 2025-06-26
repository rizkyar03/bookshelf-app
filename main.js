const unreadBooks = []; // Buku yang belum dibaca
const readBooks = []; // Buku yang sudah dibaca
let books = [];

const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

// Check if Browser is Provide Local Storage or Not
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  const submitForm = document.getElementById('bookForm');

  submitForm.addEventListener('submit', (event) => {
    event.preventDefault();
    addBook();
  });

  // Search Function
  const searchForm = document.getElementById('searchBook');
  const searchInput = document.getElementById('searchBookTitle');

  searchInput.addEventListener('input', function () {
    const query = searchInput.value;

    if (query.trim() === '') {
      document.dispatchEvent(new Event(RENDER_EVENT));
    } else {
      searchBooksByTitle(query);
    }
  });

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// Load Data from Browser Local Storage
function loadDataFromStorage() {
  const existingData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(existingData);

  if (data !== null) {
    books = data;
    readBooks.length = 0;
    unreadBooks.length = 0;

    for (const book of books) {
      if (book.isComplete) {
        readBooks.push(book);
      } else {
        unreadBooks.push(book);
      }
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

// Save Data to Browser Local Storage
function saveDataToStorage() {
  if (isStorageExist()) {
    const parsedData = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsedData);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function updateData() {
  books = [...readBooks, ...unreadBooks];
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveDataToStorage();
}

function renderBooks(containerId, bookList) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  for (const book of bookList) {
    const bookElement = createBook(book);
    container.append(bookElement);
  }
}

// RENDER_EVENT Listener
document.addEventListener(RENDER_EVENT, () => {
  renderBooks('completeBookList', readBooks);
  renderBooks('incompleteBookList', unreadBooks);
});

// SAVED_EVENT Listener
document.addEventListener(SAVED_EVENT, () => {
  console.log('Data Saved');
});

// Generate Book Object
function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

// Add New Book
function addBook() {
  const id = Number(new Date());
  const title = document.getElementById('bookFormTitle').value;
  const author = document.getElementById('bookFormAuthor').value;
  const year = parseInt(document.getElementById('bookFormYear').value);
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const bookObject = generateBookObject(id, title, author, year, isComplete);

  if (isComplete) {
    readBooks.push(bookObject);
  } else {
    unreadBooks.push(bookObject);
  }

  updateData();
}

// Create Book Item
function createBook(bookObject) {
  const textTitle = document.createElement('h3');
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = bookObject.author;

  const textYear = document.createElement('p');
  textYear.innerText = `(${bookObject.year})`;

  const isCompleteBtn = document.createElement('input');
  isCompleteBtn.setAttribute('type', 'checkbox');
  isCompleteBtn.classList = 'action-btn complete-check';
  isCompleteBtn.checked = bookObject.isComplete;

  const editBtn = document.createElement('img');
  editBtn.setAttribute('src', 'assets/edit.svg');
  editBtn.classList = 'action-btn';
  editBtn.innerText = 'Edit';

  const deleteBtn = document.createElement('img');
  deleteBtn.setAttribute('src', 'assets/delete.svg');
  deleteBtn.classList = 'action-btn';
  deleteBtn.innerText = 'Delete Book';

  const subActionContainer = document.createElement('div');
  subActionContainer.append(editBtn, deleteBtn);

  const actionContainer = document.createElement('div');
  actionContainer.classList = 'action-container';
  actionContainer.append(subActionContainer, isCompleteBtn);

  const container = document.createElement('div');
  container.classList = 'card';
  container.append(textTitle, textAuthor, textYear, actionContainer);

  isCompleteBtn.addEventListener('change', () => {
    moveBook(bookObject.id);
  });

  editBtn.addEventListener('click', () => {
    editBook(bookObject.id);
  });

  deleteBtn.addEventListener('click', () => {
    deleteBook(bookObject.id);
  });

  return container;
}

// Move Book
function moveBook(id) {
  const unreadBookIndex = unreadBooks.findIndex((book) => book.id === id);
  if (unreadBookIndex > -1) {
    const book = unreadBooks.splice(unreadBookIndex, 1)[0];
    book.isComplete = true;
    readBooks.push(book);

    updateData();
    return;
  }

  const readBookIndex = readBooks.findIndex((book) => book.id === id);
  if (readBookIndex > -1) {
    const book = readBooks.splice(readBookIndex, 1)[0];
    book.isComplete = false;
    unreadBooks.push(book);

    updateData();
    return;
  }
}

// Delete Book
function deleteBook(id) {
  const targetBook = books.find((book) => book.id === id);
  const confirmDelete = confirm(`Apa anda yakin ingin menghapus ${targetBook.title}?`);

  if (confirmDelete) {
    const unreadBookIndex = unreadBooks.findIndex((book) => book.id === id);
    if (unreadBookIndex > -1) {
      unreadBooks.splice(unreadBookIndex, 1);
    }

    const readBookIndex = readBooks.findIndex((book) => book.id === id);
    if (readBookIndex > -1) {
      readBooks.splice(readBookIndex, 1);
    }

    updateData();
  }
}

// Search Book
function searchBooksByTitle(query) {
  const normalizedQuery = query.trim().toLowerCase();

  const filteredReadBooks = readBooks.filter((book) => book.title.toLowerCase().includes(normalizedQuery));

  const filteredUnreadBooks = unreadBooks.filter((book) => book.title.toLowerCase().includes(normalizedQuery));

  renderBooks('completeBookList', filteredReadBooks);
  renderBooks('incompleteBookList', filteredUnreadBooks);
}

// Edit Book
function editBook(id) {
  const book = readBooks.find((b) => b.id === id) || unreadBooks.find((b) => b.id === id);

  if (!book) return;

  document.getElementById('editBookId').value = book.id;
  document.getElementById('editBookTitle').value = book.title;
  document.getElementById('editBookAuthor').value = book.author;
  document.getElementById('editBookYear').value = book.year;

  document.getElementById('editPopup').style.display = 'block';
  document.getElementById('overlayBlur').style.display = 'block';
}

function closeEditPopup() {
  document.getElementById('editPopup').style.display = 'none';
  document.getElementById('overlayBlur').style.display = 'none';
}

document.getElementById('editBookForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const id = Number(document.getElementById('editBookId').value);
  const newTitle = document.getElementById('editBookTitle').value;
  const newAuthor = document.getElementById('editBookAuthor').value;
  const newYear = parseInt(document.getElementById('editBookYear').value);

  const book = readBooks.find((b) => b.id === id) || unreadBooks.find((b) => b.id === id);

  if (!book) return;

  book.title = newTitle;
  book.author = newAuthor;
  book.year = newYear;

  updateData();
  closeEditPopup();
});

document.getElementById('overlayBlur').addEventListener('click', (event) => {
  if (event.target.id === 'overlayBlur') {
    closeEditPopup();
  }
});
