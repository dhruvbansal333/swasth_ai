export default function ResultCard({ result }) {
  return (
    <div className="max-h-[90vh] overflow-y-auto">

      <h2 className="text-3xl font-bold text-center mb-4 text-blue-600">
        Health Risk Report
      </h2>

      <div className="grid grid-cols-2 gap-3 text-lg">

        {/* Column 1 */}
        <div className="space-y-2">
          <p><b>Age:</b> {result.age}</p>
          <p><b>Gender:</b> {result.gender}</p>
          <p><b>Glucose:</b> {result.glucose}</p>
          <p><b>BMI:</b> {result.bmi}</p>
          <p><b>Blood Pressure:</b> {result.bp}</p>

          {/* ✅ ADDED */}
          <p><b>Skin Thickness:</b> {result.skinThickness || "-"}</p>
          <p><b>DPF:</b> {result.dpf || "-"}</p>
          <p><b>Cholesterol:</b> {result.cholesterol}</p>
          <p><b>Heart Rate:</b> {result.heartRate}</p>
          <p><b>Insulin:</b> {result.insulin}</p>
        </div>

        {/* Column 2 */}
        <div className="space-y-2">


          <p><b>Pregnancies:</b> {result.pregnancies}</p>

          {/* ✅ ADDED */}
          <p><b>Chest Pain (cp):</b> {result.cp || "-"}</p>
          <p><b>FBS:</b> {result.fbs || "-"}</p>
          <p><b>Rest ECG:</b> {result.restecg || "-"}</p>
          <p><b>Exercise Angina:</b> {result.exang || "-"}</p>
          <p><b>Oldpeak:</b> {result.oldpeak || "-"}</p>
          <p><b>Slope:</b> {result.slope || "-"}</p>
          <p><b>CA:</b> {result.ca || "-"}</p>
          <p><b>Thal:</b> {result.thal || "-"}</p>
        </div>

      </div>

      {/* Risk Results */}
      <div className="mt-8 grid grid-cols-2 gap-2 text-center">

        <div className="p-4 rounded-xl bg-red-100">
          <p className="font-semibold">Diabetes Risk</p>
          <p className="text-xl font-bold">
            {result?.diabetesRisk || "N/A"}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-yellow-100">
          <p className="font-semibold">Heart Risk</p>
          <p className="text-xl font-bold">
            {result?.heartRisk || "N/A"}
          </p>
        </div>

        {/* <div className="p-4 rounded-xl bg-blue-100">
          <p className="font-semibold">Hypertension</p>
          <p className="text-xl font-bold">
            {result?.hypertension || "N/A"}
          </p>
        </div> */}

      </div>

    </div>
  );
}