// Functions to manage CSV data in tables
function createTableRow(data, tableId) {
  const tr = document.createElement('tr');
    
  // Create editable cells
  const fields = ['id', 'name', 'age', 'gender', 'doctor', 'next_appointment'];
  fields.forEach(field => {
    const td = document.createElement('td');
    const input = document.createElement('input');
    input.type = field === 'next_appointment' ? 'date' : 'text';
    input.className = 'form-control form-control-sm';
    // For date inputs, accept already-formatted YYYY-MM-DD or empty
    input.value = data[field] || '';
    input.name = field;
    td.appendChild(input);
    tr.appendChild(td);
  });

  // Add action buttons
  const actionsTd = document.createElement('td');
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-sm btn-danger ms-2';
  deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
  deleteBtn.onclick = () => tr.remove();
  actionsTd.appendChild(deleteBtn);
  tr.appendChild(actionsTd);

  return tr;
}

function tableToCSV(tableId) {
  const tbody = document.querySelector(`#${tableId}Body`);
  const rows = Array.from(tbody.querySelectorAll('tr'));
    
  // Headers
  const csv = ['id,name,age,gender,doctor,next_appointment'];
    
  // Data rows
  rows.forEach(row => {
    const values = Array.from(row.querySelectorAll('input')).map(input => input.value);
    csv.push(values.join(','));
  });
    
  return csv.join('\n');
}

async function loadTableFromCSV(csvPath, tableId) {
  try {
    const response = await fetch(csvPath + '?_=' + Date.now());
    const text = await response.text();
    const lines = text.trim().split('\n');
        
    // Clear existing rows
    const tbody = document.querySelector(`#${tableId}Body`);
    if (!tbody) return;
    tbody.innerHTML = '';
        
    // Skip header, process data rows
    const dataRows = lines.slice(1).filter(l => l.trim().length > 0);
    dataRows.forEach(row => {
      // split on comma - simplistic but matches saved format
      const parts = row.split(',');
      const [id, name, age, gender, doctor, next_appointment] = [parts[0]||'', parts[1]||'', parts[2]||'', parts[3]||'', parts[4]||'', parts[5]||''];
      const data = { id: id.trim(), name: name.trim(), age: age.trim(), gender: gender.trim(), doctor: doctor.trim(), next_appointment: next_appointment.trim() };
      tbody.appendChild(createTableRow(data, tableId));
    });
  } catch (error) {
    console.error(`Error loading ${csvPath}:`, error);
    const statusId = tableId.replace('Table', '') + 'Status';
    const statusEl = document.getElementById(statusId);
    if (statusEl) statusEl.textContent = 'Error loading data';
  }
}

async function saveTableToCSV(tableId, csvPath) {
  const statusSpan = document.querySelector(`#${tableId.replace('Table', '')}Status`);
  try {
    const csv = tableToCSV(tableId);
    const response = await fetch('/save_csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: csvPath,
        content: csv
      })
    });

    if (!response.ok) throw new Error('Save failed');
        
    statusSpan.textContent = 'Saved successfully!';
    setTimeout(() => statusSpan.textContent = '', 3000);
  } catch (error) {
    console.error('Error saving:', error);
    if (statusSpan) statusSpan.textContent = 'Error saving data';
  }
}

// ----- Hospital stats load/save -----
async function loadHospitalStats() {
  try {
    const r = await fetch('data/hospital_stats.csv' + '?_=' + Date.now());
    const text = await r.text();
    const lines = text.trim().split('\n');
    if (lines.length < 2) return;
    const headers = lines[0].split(',').map(h => h.trim());
    const values = lines[1].split(',').map(v => v.trim());
    const data = {};
    headers.forEach((h,i) => data[h] = values[i] || '');

    document.getElementById('hs_total_doctors').value = data.total_doctors || '';
    document.getElementById('hs_total_patients').value = data.total_patients || '';
    document.getElementById('hs_appointments_today').value = data.appointments_today || '';
    document.getElementById('hs_available_beds').value = data.available_beds || '';
    const status = document.getElementById('hospitalStatsStatus');
    if (status) status.textContent = 'Loaded';
  } catch (err) {
    console.error('Error loading hospital stats', err);
    const status = document.getElementById('hospitalStatsStatus');
    if (status) status.textContent = 'Error loading';
  }
}

async function saveHospitalStats() {
  const status = document.getElementById('hospitalStatsStatus');
  try {
    const td = document.getElementById('hs_total_doctors').value || '0';
    const tp = document.getElementById('hs_total_patients').value || '0';
    const at = document.getElementById('hs_appointments_today').value || '0';
    const ab = document.getElementById('hs_available_beds').value || '0';

    const csv = ['total_doctors,total_patients,appointments_today,available_beds', `${td},${tp},${at},${ab}`].join('\n');

    const resp = await fetch('/save_csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: 'hospital_stats.csv', content: csv })
    });
    if (!resp.ok) throw new Error('Save failed');
    if (status) { status.textContent = 'Saved'; setTimeout(()=>status.textContent='', 2500); }
  } catch (err) {
    console.error('Error saving hospital stats', err);
    if (status) status.textContent = 'Error saving';
  }
}

// Initialize tables
document.addEventListener('DOMContentLoaded', () => {
  // Load initial data
  loadTableFromCSV('data/doctor_patients.csv', 'doctorTable');
  loadTableFromCSV('data/patient_patients.csv', 'patientTable');
  loadTableFromCSV('data/nurse_patients.csv', 'nurseTable');

  // Load hospital stats
  if (typeof loadHospitalStats === 'function') loadHospitalStats();

  // Add row buttons
  const addDoctorBtn = document.querySelector('#addDoctorRow');
  if (addDoctorBtn) addDoctorBtn.onclick = () => {
    const tbody = document.querySelector('#doctorTableBody');
    tbody.appendChild(createTableRow({id: '', name: '', age: '', gender: '', doctor: '', next_appointment: ''}, 'doctorTable'));
  };
  const addPatientBtn = document.querySelector('#addPatientRow');
  if (addPatientBtn) addPatientBtn.onclick = () => {
    const tbody = document.querySelector('#patientTableBody');
    tbody.appendChild(createTableRow({id: '', name: '', age: '', gender: '', doctor: '', next_appointment: ''}, 'patientTable'));
  };
  const addNurseBtn = document.querySelector('#addNurseRow');
  if (addNurseBtn) addNurseBtn.onclick = () => {
    const tbody = document.querySelector('#nurseTableBody');
    tbody.appendChild(createTableRow({id: '', name: '', age: '', gender: '', doctor: '', next_appointment: ''}, 'nurseTable'));
  };

  // Save buttons
  const saveDoctorBtn = document.querySelector('#saveDoctorTable');
  if (saveDoctorBtn) saveDoctorBtn.onclick = () => saveTableToCSV('doctorTable', 'data/doctor_patients.csv');
  const savePatientBtn = document.querySelector('#savePatientTable');
  if (savePatientBtn) savePatientBtn.onclick = () => saveTableToCSV('patientTable', 'data/patient_patients.csv');
  const saveNurseBtn = document.querySelector('#saveNurseTable');
  if (saveNurseBtn) saveNurseBtn.onclick = () => saveTableToCSV('nurseTable', 'data/nurse_patients.csv');

  // Hospital stats save button
  const saveHospitalBtn = document.querySelector('#saveHospitalStats');
  if (saveHospitalBtn) saveHospitalBtn.onclick = () => saveHospitalStats();
});
