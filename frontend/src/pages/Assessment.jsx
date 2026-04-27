import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlash } from '../context/FlashContext';
import { predictionService } from '../services/api';

const INITIAL = {
  age: '', gender: '', avg_glucose_level: '', hypertension: '',
  heart_disease: '', ever_married: '', residence_type: '',
  smoking_status: '', work_type: '', bmi: '',
};

const FIELDS = [
  { name: 'age',              label: 'Age',                  icon: 'fa-user-clock',  type: 'number', placeholder: 'e.g. 45', min: 0,   max: 120 },
  { name: 'gender',           label: 'Gender',               icon: 'fa-venus-mars',  type: 'select', options: [['male','Male'],['female','Female']] },
  { name: 'avg_glucose_level',label: 'Avg Glucose (mg/dL)',  icon: 'fa-tint',        type: 'number', placeholder: 'e.g. 105', min: 40, max: 300, step: '0.01' },
  { name: 'hypertension',     label: 'Hypertension',         icon: 'fa-heart',       type: 'select', options: [['0','No'],['1','Yes']] },
  { name: 'heart_disease',    label: 'Heart Disease',        icon: 'fa-heartbeat',   type: 'select', options: [['0','No'],['1','Yes']] },
  { name: 'ever_married',     label: 'Ever Married',         icon: 'fa-ring',        type: 'select', options: [['yes','Yes'],['no','No']] },
  { name: 'residence_type',   label: 'Residence Type',       icon: 'fa-home',        type: 'select', options: [['urban','Urban'],['rural','Rural']] },
  { name: 'smoking_status',   label: 'Smoking Status',       icon: 'fa-smoking',     type: 'select', options: [['never smoked','Never Smoked'],['formerly smoked','Formerly Smoked'],['smokes','Smokes'],['unknown','Unknown']] },
  { name: 'work_type',        label: 'Work Type',            icon: 'fa-briefcase',   type: 'select', options: [['Private','Private'],['Self-employed','Self-employed'],['Govt_job','Government Job'],['children','Children'],['Never_worked','Never Worked']] },
  { name: 'bmi',              label: 'BMI',                  icon: 'fa-weight',      type: 'number', placeholder: 'e.g. 24.5', min: 10, max: 100, step: '0.1' },
];

export default function Assessment() {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { flash } = useFlash();
  const navigate = useNavigate();

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); }

  function validate() {
    const e = {};
    if (!form.age || isNaN(form.age) || +form.age < 0 || +form.age > 120) e.age = 'Enter a valid age (0–120)';
    if (!form.avg_glucose_level || +form.avg_glucose_level < 40 || +form.avg_glucose_level > 300) e.avg_glucose_level = 'Enter glucose level (40–300)';
    if (!form.bmi || +form.bmi < 10 || +form.bmi > 100) e.bmi = 'Enter BMI (10–100)';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const payload = {
        ...form,
        age: +form.age,
        avg_glucose_level: +form.avg_glucose_level,
        bmi: +form.bmi,
        hypertension: +form.hypertension,
        heart_disease: +form.heart_disease,
      };
      const res = await predictionService.predict(payload);
      navigate('/result', { state: res.data });
    } catch (err) {
      flash(err.response?.data?.message || 'Prediction failed. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell--narrow">
      <div className="surface-glass fade-up">
        <div className="text-center mb-4">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.5rem' }}>
            <i className="fas fa-brain" style={{ color: 'var(--clr-primary)', marginRight: '0.5rem' }} />
            Stroke Risk Assessment
          </h1>
          <p className="text-muted">
            Stroke is the second leading cause of death globally. This AI tool assesses your risk
            based on health factors. Fill in the fields below for an accurate prediction.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-grid">
            {FIELDS.map(f => (
              <div className="form-group" key={f.name}>
                <label className="form-label">
                  <i className={`fas ${f.icon}`} style={{ marginRight: '0.4rem' }} />
                  {f.label}
                </label>
                {f.type === 'select' ? (
                  <select
                    className={`form-control ${!form[f.name] ? 'placeholder' : ''}`} 
                    value={form[f.name] || ""}
                    onChange={e => set(f.name, e.target.value)}
                  >
                    <option value="" disabled>Choose option</option>

                    {f.options.map(([val, lbl]) => (
                      <option key={val} value={val}>{lbl}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    className={`form-control ${errors[f.name] ? 'error' : ''}`}
                    placeholder={f.placeholder}
                    min={f.min} max={f.max} step={f.step || '1'}
                    value={form[f.name]}
                    onChange={e => set(f.name, e.target.value)}
                  />
                )}
                {errors[f.name] && <span className="form-error">{errors[f.name]}</span>}
              </div>
            ))}
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading
              ? <><i className="fas fa-circle-notch fa-spin" /> Analyzing…</>
              : <><i className="fas fa-heartbeat" /> Analyze Stroke Risk</>}
          </button>
        </form>
      </div>
    </div>
  );
}
