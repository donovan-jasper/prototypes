### 1. App Name
Ichinichi

### 2. One-line pitch
Ichinichi is a minimalist, local-first journaling app that empowers users to record one note per day, with end-to-end encryption and immutable past entries.

### 3. Tech stack
* Backend: Node/Express
* Database: SQLite
* Frontend: Vanilla HTML/CSS/JS
* Encryption: Crypto-JS library for client-side encryption

### 4. Core features
1. **Daily Note**: Users can create one note per day, with a simple text editor.
2. **Immutable Past Entries**: Past notes are immutable and cannot be edited or deleted.
3. **Local-first Storage**: Notes are stored locally on the user's device, with optional syncing across devices.
4. **End-to-end Encryption**: Notes are encrypted on the client-side using a user-provided password.
5. **Simple Calendar View**: A calendar view to navigate and view past notes.

### 5. File structure
```
ichinichi/
app.js
config/
database.js
encryption.js
public/
index.html
styles.css
script.js
package.json
README.md
```

### 6. Implementation steps
#### Step 1: Set up the project structure
* Create a new Node project using `npm init`
* Install required dependencies: `express`, `sqlite3`, `crypto-js`
* Create the file structure as described above

#### Step 2: Implement the database
* Create a new SQLite database using `sqlite3`
* Define a schema for the notes table: `id`, `date`, `note`, `encrypted_note`
* Implement CRUD operations for notes

#### Step 3: Implement encryption
* Use the Crypto-JS library to encrypt and decrypt notes on the client-side
* Generate a random salt and store it locally
* Use the user-provided password to derive a key for encryption and decryption

#### Step 4: Implement the daily note feature
* Create a simple text editor in `index.html`
* Use JavaScript to get the current date and check if a note already exists for that date
* If a note exists, display it in read-only mode; otherwise, allow the user to create a new note

#### Step 5: Implement immutable past entries
* When a user tries to edit or delete a past note, display an error message indicating that past notes are immutable

#### Step 6: Implement local-first storage
* Store notes in the SQLite database on the user's device
* Use JavaScript to sync notes across devices (optional)

#### Step 7: Implement the simple calendar view
* Create a calendar view in `index.html` using HTML and CSS
* Use JavaScript to populate the calendar view with past notes

### 7. How to test it works
1. **Test the daily note feature**:
	* Create a new note for the current date
	* Verify that the note is stored in the database and displayed in the calendar view
	* Try to create another note for the same date; verify that an error message is displayed
2. **Test immutable past entries**:
	* Create a new note for a past date
	* Try to edit or delete the note; verify that an error message is displayed
3. **Test local-first storage**:
	* Create a new note and verify that it is stored in the database
	* Close the app and reopen it; verify that the note is still displayed
4. **Test end-to-end encryption**:
	* Create a new note and verify that it is encrypted in the database
	* Try to decrypt the note using the wrong password; verify that an error message is displayed
5. **Test the simple calendar view**:
	* Create several notes for different dates
	* Verify that the calendar view displays all past notes correctly