import { AppLayout } from '../components/AppLayout';
import { usePageSetup } from '../hooks/usePageSetup';

export function GradeCalculatorPage() {
  usePageSetup({
    bodyClass: '',
    scripts: ['gradeCalculator']
  });

  return (
    <AppLayout>
      <main className="grade-calculator" id="main" data-grade-calculator="">
        <header className="grade-calculator__header">
          <h1 className="grade-calculator__title">
            <span className="grade-calculator__title-icon" aria-hidden="true">
              📊
            </span>
            <span data-i18n="gradeCalculator.title">Grade Calculator</span>
          </h1>
        </header>

        <section className="grade-calculator__section" aria-labelledby="add-grade-heading">
          <h2 id="add-grade-heading" className="grade-calculator__section-title" data-i18n="gradeCalculator.add.title">
            Add grade
          </h2>
          <form className="grade-calculator__form grade-calculator__form--inline" id="addForm" noValidate>
            <div className="grade-calculator__field">
              <label className="grade-calculator__label" htmlFor="note" data-i18n="gradeCalculator.add.gradeLabel">
                Grade
              </label>
              <input
                id="note"
                className="grade-calculator__input"
                type="number"
                step="0.01"
                min="1"
                max="6"
                placeholder="e.g. 5.5"
                data-i18n-attr="placeholder:gradeCalculator.add.gradePlaceholder"
                aria-describedby="gradeError"
                inputMode="decimal"
              />
              <p className="grade-calculator__error" id="gradeError" role="status" aria-live="polite"></p>
            </div>
            <div className="grade-calculator__field">
              <label className="grade-calculator__label" htmlFor="gewichtung" data-i18n="gradeCalculator.add.weightLabel">
                Weight
              </label>
              <input
                id="gewichtung"
                className="grade-calculator__input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 1"
                data-i18n-attr="placeholder:gradeCalculator.add.weightPlaceholder"
                aria-describedby="weightError"
                inputMode="decimal"
              />
              <p className="grade-calculator__error" id="weightError" role="status" aria-live="polite"></p>
            </div>
            <div className="grade-calculator__action">
              <button type="submit" id="add" className="grade-calculator__button grade-calculator__button--primary" disabled aria-disabled="true">
                <span data-i18n="gradeCalculator.add.addButton">Add</span>
                <span aria-hidden="true">＋</span>
              </button>
            </div>
          </form>

          <div className="grade-calculator__table-wrapper">
            <table id="notenTabelle" className="grade-calculator__table">
              <thead>
                <tr>
                  <th scope="col" data-i18n="gradeCalculator.table.number">
                    No.
                  </th>
                  <th scope="col" data-i18n="gradeCalculator.table.grade">
                    Grade
                  </th>
                  <th scope="col" data-i18n="gradeCalculator.table.weight">
                    Weight
                  </th>
                  <th scope="col" className="visually-hidden" data-i18n="gradeCalculator.table.actions">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>

          <div className="grade-calculator__summary" aria-live="polite">
            <div className="grade-calculator__summary-row" id="schnitt">
              <span className="grade-calculator__summary-label" data-i18n="gradeCalculator.summary.average">
                Average
              </span>
              <span className="grade-calculator__summary-value" id="averageValue">
                –
              </span>
            </div>
          </div>
        </section>

        <section className="grade-calculator__section" aria-labelledby="target-heading">
          <h2 id="target-heading" className="grade-calculator__section-title" data-i18n="gradeCalculator.target.title">
            Target average
          </h2>
          <form className="grade-calculator__form grade-calculator__form--inline" id="targetForm" noValidate>
            <div className="grade-calculator__field">
              <label className="grade-calculator__label" htmlFor="ziel" data-i18n="gradeCalculator.target.targetLabel">
                Target average
              </label>
              <input
                id="ziel"
                className="grade-calculator__input"
                type="number"
                step="0.01"
                min="1"
                max="6"
                placeholder="e.g. 5"
                data-i18n-attr="placeholder:gradeCalculator.target.targetPlaceholder"
                aria-describedby="targetError"
                inputMode="decimal"
              />
              <p className="grade-calculator__error" id="targetError" role="status" aria-live="polite"></p>
            </div>
            <div className="grade-calculator__field">
              <label className="grade-calculator__label" htmlFor="zusaetzlich" data-i18n="gradeCalculator.target.nextWeightLabel">
                Weight of next grade
              </label>
              <input
                id="zusaetzlich"
                className="grade-calculator__input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 1"
                data-i18n-attr="placeholder:gradeCalculator.target.nextWeightPlaceholder"
                aria-describedby="nextWeightError"
                inputMode="decimal"
              />
              <p className="grade-calculator__error" id="nextWeightError" role="status" aria-live="polite"></p>
            </div>
            <div className="grade-calculator__action">
              <button type="submit" id="berechnen" className="grade-calculator__button grade-calculator__button--primary" disabled aria-disabled="true">
                <span data-i18n="gradeCalculator.target.calculateButton">Calculate</span>
                <span aria-hidden="true">=</span>
              </button>
            </div>
          </form>

          <div className="grade-calculator__footer" aria-live="polite">
            <div className="grade-calculator__required" id="zielNote" data-state="idle" data-i18n="gradeCalculator.target.required">
              Required grade: –
            </div>
          </div>
        </section>

        <div className="grade-calculator__back">
          <a className="grade-calculator__button grade-calculator__button--secondary" href="/index.html">
            <span aria-hidden="true">◀️</span>
            <span data-i18n="gradeCalculator.back">Back</span>
          </a>
        </div>
      </main>
    </AppLayout>
  );
}

