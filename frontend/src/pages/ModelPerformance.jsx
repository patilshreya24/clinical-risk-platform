import {
  BarChart3,
  CheckCircle2,
  Target,
  Activity,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

function ModelPerformance() {
  const models = [
    {
      name: "Tuned Logistic Regression",
      shortName: "Logistic Regression",
      accuracy: 86.67,
      precision: 91.67,
      recall: 78.57,
      f1: 84.62,
      rocAuc: 95.09,
    },
    {
      name: "Tuned Random Forest",
      shortName: "Random Forest",
      accuracy: 85.0,
      precision: 88.0,
      recall: 78.57,
      f1: 83.02,
      rocAuc: 94.2,
    },
    {
      name: "Tuned XGBoost",
      shortName: "XGBoost",
      accuracy: 81.67,
      precision: 84.0,
      recall: 75.0,
      f1: 79.25,
      rocAuc: 89.51,
    },
  ];

  const bestModel = models.reduce((best, model) =>
    model.rocAuc > best.rocAuc ? model : best
  );

  const bestAccuracy = Math.max(...models.map((model) => model.accuracy));
  const bestRocAuc = Math.max(...models.map((model) => model.rocAuc));

  return (
    <div className="dashboard-content">

      {/* PAGE HEADER */}
      <div className="page-header-row">
        <div>
          <h2>Model Performance</h2>
          <p>
            Compare the performance of trained cardiovascular risk prediction
            models.
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="patient-summary-grid performance-summary-grid">

        <div className="summary-card">
          <div className="summary-icon blue">
            <BarChart3 size={20} />
          </div>

          <div>
            <span>Models Evaluated</span>
            <strong>{models.length}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon green">
            <Target size={20} />
          </div>

          <div>
            <span>Best Accuracy</span>
            <strong>{bestAccuracy.toFixed(2)}%</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon orange">
            <TrendingUp size={20} />
          </div>

          <div>
            <span>Best ROC-AUC</span>
            <strong>{bestRocAuc.toFixed(2)}%</strong>
          </div>
        </div>

      </div>

      {/* SELECTED MODEL */}
      <section className="panel best-model-panel">

        <div className="best-model-icon">
          <CheckCircle2 size={22} />
        </div>

        <div>
          <span className="best-model-label">
            SELECTED MODEL
          </span>

          <h3>{bestModel.name}</h3>

          <p>
            Selected based on the project's held-out test-set evaluation.
          </p>
        </div>

        <div className="best-model-score">
          <strong>{bestModel.rocAuc.toFixed(2)}%</strong>
          <span>ROC-AUC</span>
        </div>

      </section>

      {/* MODEL COMPARISON */}
      <section className="panel performance-table-panel">

        <div className="patients-toolbar">
          <div>
            <h3>Model Comparison</h3>
            <p>
              Evaluation metrics calculated on the held-out test set.
            </p>
          </div>
        </div>

        <div className="performance-table">

          <div className="performance-row performance-heading">
            <span>Model</span>
            <span>Accuracy</span>
            <span>Precision</span>
            <span>Recall</span>
            <span>F1 Score</span>
            <span>ROC-AUC</span>
          </div>

          {models.map((model) => (
            <div
              className={`performance-row ${
                model === bestModel ? "selected-model-row" : ""
              }`}
              key={model.name}
            >

              <div className="model-name">
                <div className="model-icon">
                  <Activity size={17} />
                </div>

                <div>
                  <strong>{model.shortName}</strong>

                  {model === bestModel && (
                    <small>Selected model</small>
                  )}
                </div>
              </div>

              <span>{model.accuracy.toFixed(2)}%</span>
              <span>{model.precision.toFixed(2)}%</span>
              <span>{model.recall.toFixed(2)}%</span>
              <span>{model.f1.toFixed(2)}%</span>

              <strong className="roc-score">
                {model.rocAuc.toFixed(2)}%
              </strong>

            </div>
          ))}

        </div>
      </section>

      {/* ROC-AUC VISUALIZATION */}
      <section className="panel metric-chart-panel">

        <div className="panel-header">
          <div>
            <h3>ROC-AUC Comparison</h3>
            <p>
              Comparison of the area under the receiver operating
              characteristic curve.
            </p>
          </div>

          <div className="chart-badge">
            Higher is better
          </div>
        </div>

        <div className="metric-bars">

          {models.map((model) => (
            <div
              className={`metric-bar-item ${
                model === bestModel ? "selected-metric" : ""
              }`}
              key={model.name}
            >

              <div className="metric-bar-header">

                <div className="metric-model-name">
                  <span>{model.shortName}</span>

                  {model === bestModel && (
                    <small>Selected</small>
                  )}
                </div>

                <strong>
                  {model.rocAuc.toFixed(2)}%
                </strong>

              </div>

              <div className="metric-bar-track">
                <div
                  className="metric-bar-fill"
                  style={{
                    width: `${model.rocAuc}%`,
                  }}
                />
              </div>

            </div>
          ))}

        </div>

        <div className="roc-scale">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>

      </section>

      {/* INTERPRETATION */}
      <section className="panel performance-info-panel">

        <div className="performance-info-icon">
          <ShieldCheck size={20} />
        </div>

        <div>
          <h3>About Model Evaluation</h3>

          <p>
            ROC-AUC measures how well a model distinguishes between the two
            classes across different classification thresholds. Accuracy,
            precision, recall, F1 score and ROC-AUC are calculated from the
            project's held-out cardiovascular dataset.
          </p>

          <p className="info-warning">
            These metrics describe machine-learning performance on the
            evaluation data and should not be interpreted as clinical
            validation.
          </p>
        </div>

      </section>

    </div>
  );
}

export default ModelPerformance;