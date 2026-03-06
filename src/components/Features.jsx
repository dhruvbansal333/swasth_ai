export default function Features() {
  const features = [
    {
      title: "Early Prediction",
      description:
        "Detect diabetes, hypertension & heart risk before symptoms appear.",
    },
    {
      title: "AI Powered",
      description:
        "Machine learning models trained on real medical datasets.",
    },
    {
      title: "Smart Prevention",
      description:
        "Get personalized preventive recommendations instantly.",
    },
  ];

  return (
    <div className="py-2 px-3 bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-200">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-center">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl border border-white/40 shadow-xl hover:scale-105 transition"
          >
            <h3 className="text-2xl font-bold mb-3 text-blue-600">
              {feature.title}
            </h3>

            <p className="text-gray-700">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}