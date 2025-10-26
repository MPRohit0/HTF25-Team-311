from flask import Flask,redirect, url_for, render_template, send_from_directory, request
import pandas as pd
import os

app = Flask(__name__, template_folder = 'FrontEnd',static_folder='FrontEnd',static_url_path='')


@app.route("/") #take /<var> it is stores in var.
def home():
    return render_template('medipanelpro2.html')

@app.route("/login.html") 
def login():
    return render_template('login.html')

# logging in
@app.route("/login_pa.html", methods=["POST"])
def patient():
    email = request.form.get("email", "").strip()
    password = request.form.get("password", "")

    # build an absolute path so CSV is found regardless of working directory
    credentials_file = os.path.join(app.root_path, "credentials", "patient.csv")

    cred = pd.read_csv(credentials_file, dtype=str).fillna("")


    # case-insensitive column check
    cols = {c.lower(): c for c in cred.columns}
    if "email" not in cols or "password" not in cols:
        return render_template('medipanelpro2.html', error="Server error: invalid credentials file.")

    email_col = cols["email"]
    password_col = cols["password"]

    # locate the row(s) matching the email
    matches = cred.loc[cred[email_col].astype(str).str.strip().str.lower() == email.lower()]
    if matches.empty:
        return render_template('medipanelpro2.html', error="Invalid email or password.")

    row = matches.iloc[0]
    # compare as strings (for production use hashed passwords + check_password_hash)
    if str(row[password_col]) == password:
        return render_template('patient.html')
    else:
        return render_template('medipanelpro2.html', error="Invalid email or password.")


@app.route("/login_doc.html", methods=["POST"]) 
def doctor():
    email = request.form.get("email", "").strip()
    password = request.form.get("password", "")

    # build an absolute path so CSV is found regardless of working directory
    credentials_file = os.path.join(app.root_path, "credentials", "doc.csv")

    cred = pd.read_csv(credentials_file, dtype=str).fillna("")


    # case-insensitive column check
    cols = {c.lower(): c for c in cred.columns}
    if "email" not in cols or "password" not in cols:
        return render_template('medipanelpro2.html', error="Server error: invalid credentials file.")

    email_col = cols["email"]
    password_col = cols["password"]

    # locate the row(s) matching the email
    matches = cred.loc[cred[email_col].astype(str).str.strip().str.lower() == email.lower()]
    if matches.empty:
        return render_template('medipanelpro2.html', error="Invalid email or password.")

    row = matches.iloc[0]
    # compare as strings (for production use hashed passwords + check_password_hash)
    if str(row[password_col]) == password:
        return render_template('doctor.html')
    else:
        return render_template('medipanelpro2.html', error="Invalid email or password.")

@app.route("/login_nurse.html", methods=["POST"]) 
def nuerse():
    email = request.form.get("email")
    password = request.form.get("password")

    cred = pd.read_csv("credentials/nurse.csv")

    if email in cred.email:
        ind = cred[cred['email']==email].index.tolist()
    elif password == cred.password[ind]:
        return render_template('nurse.html')
    else:
        return render_template('medipanelpro2.html', error="Invalid credentials!")

@app.route("/log_tech.html", methods=["POST"]) 
def tech():
    email = request.form.get("email")
    password = request.form.get("password")
    
    cred = pd.read_csv("credentials/tech.csv")

    if email in cred.email:
        ind = cred[cred['email']==email].index.tolist()
    elif password == cred.password[ind]:
        return render_template('technical.html')
    else:
        return render_template('medipanelpro2.html', error="Invalid credentials!")




# endpoint to allow saving specific CSV files from the front-end editor
@app.route('/save_csv', methods=['POST'])
def save_csv():
    # Accept JSON or form data
    data = request.get_json(silent=True)
    if data is None:
        data = request.form.to_dict()

    filename = data.get('filename')
    content = data.get('content')

    # only allow specific files to be overwritten for safety
    allowed = {
        'doctor_patients.csv',
        'nurse_patients.csv',
        'patient_patients.csv',
        'hospital_stats.csv'
    }

    if not filename or filename not in allowed:
        return { 'ok': False, 'error': 'filename not allowed' }, 400

    # build absolute path under the FrontEnd/data folder
    target = os.path.join(app.root_path, 'FrontEnd', 'data', filename)
    try:
        # write the content (overwrite)
        with open(target, 'w', encoding='utf-8') as f:
            f.write(content)
        return { 'ok': True }
    except Exception as e:
        return { 'ok': False, 'error': str(e) }, 500


# @app.route('/<path:filename>')
# def serve_static(filename):
#     if filename in pages:
#         return send_from_directory('FrontEnd', filename)
#     else:
#         return render_template('medipanelpro2.html')  

if __name__ == "__main__":
    app.run()


