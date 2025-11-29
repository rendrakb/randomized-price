const CONFIG = {
  DATA: {
    MIN_TOTAL: 100,
    MAX_TOTAL: 1000,
    STEP: 50,
    MIN_QUANTITY: 5,
    MAX_QUANTITY: 100,
    QUANTITY_STEP: 5,
  },
  COLORS: {
    CORRECT: "lightgreen",
    INCORRECT: "red",
  },
  ITEMS: ['A', 'B', 'C', 'D', 'E', 'F']
};

const state = {
  itemData: null,
  questionTemplates: [],
  currentQuestion: null,
  currentAnswer: null,
  pageStartTime: Date.now(),
  lastSubmitTime: null,
  correctCount: 0,
  totalAttempts: 0,
  currentQuestionSubmitted: false,
};

class ItemDataManager {
  constructor() {
    this.data = null;
  }

  randomize() {
    const items = {};

    CONFIG.ITEMS.forEach(itemName => {
      const quantitySteps = Math.floor(Math.random() * ((CONFIG.DATA.MAX_QUANTITY - CONFIG.DATA.MIN_QUANTITY) / CONFIG.DATA.QUANTITY_STEP + 1));
      const quantity = CONFIG.DATA.MIN_QUANTITY + quantitySteps * CONFIG.DATA.QUANTITY_STEP;
      
      const priceSteps = Math.floor(Math.random() * ((CONFIG.DATA.MAX_TOTAL - CONFIG.DATA.MIN_TOTAL) / CONFIG.DATA.STEP + 1));
      const totalPrice = CONFIG.DATA.MIN_TOTAL + priceSteps * CONFIG.DATA.STEP;
      
      const pricePerUnit = totalPrice / quantity;
      
      items[itemName] = {
        quantity: quantity,
        totalPrice: totalPrice,
        pricePerUnit: pricePerUnit
      };
    });

    const overallTotal = Object.values(items).reduce((sum, item) => sum + item.totalPrice, 0);

    this.data = {
      total: overallTotal,
      items: items
    };

    return this.data;
  }

  getData() {
    return this.data;
  }

  getItem(itemName) {
    if (!this.data || !this.data.items[itemName]) return null;
    return this.data.items[itemName];
  }
}

class ItemRenderer {
  constructor() {
    this.containers = {
      itemA: document.getElementById("item-a"),
      itemB: document.getElementById("item-b"),
      itemC: document.getElementById("item-c"),
      itemD: document.getElementById("item-d"),
      itemE: document.getElementById("item-e"),
      itemF: document.getElementById("item-f"),
    };
  }

  render(data) {
    if (!data) return;
    
    CONFIG.ITEMS.forEach(itemName => {
      const item = data.items[itemName];
      const containerId = `item${itemName}`;
      if (this.containers[containerId]) {
        this.containers[containerId].innerHTML = 
          `<strong>${itemName}</strong> ; <strong>${item.quantity}</strong> ; <strong>$${item.totalPrice}</strong>`;
      }
    });
  }
}

class QuestionGenerator {
  constructor(dataManager) {
    this.dataManager = dataManager;
  }

  static pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  generateVariables(variableNames) {
    const vars = {};

    variableNames.forEach((varName) => {
      if (varName === "item") {
        vars[varName] = QuestionGenerator.pickRandom(CONFIG.ITEMS);
      } else if (varName === "itemA") {
        vars[varName] = QuestionGenerator.pickRandom(CONFIG.ITEMS);
      } else if (varName === "itemB") {
        const availableItems = vars.itemA
          ? CONFIG.ITEMS.filter((item) => item !== vars.itemA)
          : CONFIG.ITEMS;
        vars[varName] = QuestionGenerator.pickRandom(availableItems);
      }
    });

    return vars;
  }

  calculateAnswer(type, vars) {
    const data = this.dataManager.getData();
    if (!data) return null;

    switch (type) {
      case "cheapestItem":
        return this.findCheapestItem(data);

      case "expensivestItem":
        return this.findMostExpensiveItem(data);

      case "pricePerUnit":
        return this.getPricePerUnit(vars, data);

      case "moreExpensive":
        return this.compareMoreExpensive(vars, data);

      case "moreCheap":
        return this.compareCheaper(vars, data);

      case "totalPercentage":
        return this.calculateTotalPercentage(vars, data);

      case "priceDifference":
        return this.calculatePriceDifference(vars, data);

      case "totalQuantity":
        return this.calculateTotalQuantity(data);

      case "averageTotalPrice":
        return this.calculateAverageTotalPrice(data);

      case "quantityPercentage":
        return this.calculateQuantityPercentage(vars, data);

      case "hypotheticalPrice":
        return this.calculateHypotheticalPrice(vars, data);

      case "hypotheticalQuantity":
        return this.calculateHypotheticalQuantity(vars, data);

      default:
        console.warn(`Unknown question type: ${type}`);
        return null;
    }
  }

  findCheapestItem(data) {
    let cheapest = null;
    let minPrice = Infinity;

    CONFIG.ITEMS.forEach(itemName => {
      const item = data.items[itemName];
      if (item.pricePerUnit < minPrice) {
        minPrice = item.pricePerUnit;
        cheapest = itemName;
      }
    });

    return cheapest;
  }

  findMostExpensiveItem(data) {
    let mostExpensive = null;
    let maxPrice = -Infinity;

    CONFIG.ITEMS.forEach(itemName => {
      const item = data.items[itemName];
      if (item.pricePerUnit > maxPrice) {
        maxPrice = item.pricePerUnit;
        mostExpensive = itemName;
      }
    });

    return mostExpensive;
  }

  getPricePerUnit(vars, data) {
    const item = data.items[vars.item];
    return Number(item.pricePerUnit.toFixed(2));
  }

  compareMoreExpensive(vars, data) {
    const itemA = data.items[vars.itemA];
    const itemB = data.items[vars.itemB];
    return itemA.pricePerUnit > itemB.pricePerUnit ? vars.itemA : vars.itemB;
  }

  compareCheaper(vars, data) {
    const itemA = data.items[vars.itemA];
    const itemB = data.items[vars.itemB];
    return itemA.pricePerUnit < itemB.pricePerUnit ? vars.itemA : vars.itemB;
  }

  calculateTotalPercentage(vars, data) {
    const item = data.items[vars.item];
    const percentage = (item.totalPrice / data.total) * 100;
    return `${Math.round(percentage)}%`;
  }

  calculatePriceDifference(vars, data) {
    const itemA = data.items[vars.itemA];
    const itemB = data.items[vars.itemB];
    const diff = Math.abs(itemA.pricePerUnit - itemB.pricePerUnit);
    return Number(diff.toFixed(2));
  }

  calculateTotalQuantity(data) {
    let total = 0;
    CONFIG.ITEMS.forEach(itemName => {
      total += data.items[itemName].quantity;
    });
    return total;
  }

  calculateAverageTotalPrice(data) {
    const sum = CONFIG.ITEMS.reduce((acc, itemName) => {
      return acc + data.items[itemName].totalPrice;
    }, 0);
    return Number((sum / CONFIG.ITEMS.length).toFixed(2));
  }

  calculateQuantityPercentage(vars, data) {
    const item = data.items[vars.item];
    const totalQty = this.calculateTotalQuantity(data);
    const percentage = (item.quantity / totalQty) * 100;
    return `${Math.round(percentage)}%`;
  }

  calculateHypotheticalPrice(vars, data) {
    const referenceItem = data.items[vars.item];
    const pricePerUnit = referenceItem.pricePerUnit;
    
    let total = 0;
    CONFIG.ITEMS.forEach(itemName => {
      const item = data.items[itemName];
      total += pricePerUnit * item.quantity;
    });
    
    return Math.round(total);
  }

  calculateHypotheticalQuantity(vars, data) {
    const referenceItem = data.items[vars.item];
    const quantity = referenceItem.quantity;
    
    let total = 0;
    CONFIG.ITEMS.forEach(itemName => {
      const item = data.items[itemName];
      total += item.pricePerUnit * quantity;
    });
    
    return Math.round(total);
  }

  generate() {
    if (!state.questionTemplates.length || !this.dataManager.getData()) {
      console.warn("Cannot generate question: missing templates or data");
      return null;
    }

    const template = QuestionGenerator.pickRandom(state.questionTemplates);
    const variables = this.generateVariables(template.variables);
    const answer = this.calculateAnswer(template.type, variables);

    let questionText = template.template;
    Object.entries(variables).forEach(([key, value]) => {
      questionText = questionText.replace(`{${key}}`, value);
    });

    state.currentQuestion = questionText;
    state.currentAnswer = answer;

    return { question: questionText, answer };
  }
}

class UIController {
  constructor() {
    this.elements = {
      questionDisplay: document.querySelector(".questions"),
      answerInput: document.getElementById("answerInput"),
      feedback: document.getElementById("feedback"),
      answerDiv: null,
      score: document.getElementById("score"),
      lastTime: document.getElementById("last-time"),
      totalTime: document.getElementById("total-time"),
    };
  }

  displayQuestion(question, answer) {
    this.elements.questionDisplay.innerHTML = `
      <strong>${question}</strong><br>
      <div id="answer" style="display:none;">Answer: ${answer}</div>
    `;
    this.clearInput();
    this.clearFeedback();
    this.updateAnswerElement();
  }

  updateAnswerElement() {
    this.elements.answerDiv = document.getElementById("answer");
  }

  clearInput() {
    this.elements.answerInput.value = "";
  }

  clearFeedback() {
    this.elements.feedback.textContent = "";
    this.elements.feedback.style.color = "";
  }

  showAnswer() {
    if (this.elements.answerDiv) {
      this.elements.answerDiv.style.display = "block";
    }
  }

  showFeedback(isCorrect) {
    this.elements.feedback.textContent = isCorrect ? "Correct." : "Wrong";
    this.elements.feedback.style.color = isCorrect
      ? CONFIG.COLORS.CORRECT
      : CONFIG.COLORS.INCORRECT;
  }

  updateScore() {
    this.elements.score.textContent = `Score: ${state.correctCount}/${state.totalAttempts}`;
  }

  updateLastTime(seconds) {
    this.elements.lastTime.textContent = `Last time spent: ${this.formatTime(
      seconds
    )}`;
  }

  updateTotalTime() {
    const totalSeconds = (Date.now() - state.pageStartTime) / 1000;
    this.elements.totalTime.textContent = `Total time spent: ${this.formatTime(
      totalSeconds
    )}`;
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  }

  getUserAnswer() {
    return this.elements.answerInput.value;
  }
}

class AnswerValidator {
  static normalize(answer, expectedHasPercent = false) {
    if (answer == null) return "";

    let normalized = String(answer).trim().toLowerCase();
    normalized = normalized.replace(/,/g, "");

    const num = parseFloat(normalized.replace("%", ""));
    if (!isNaN(num)) {
      if (expectedHasPercent) {
        return `${Math.abs(num)}%`;
      } else {
        return Math.abs(num);
      }
    }

    return normalized;
  }

  static isCorrect(userAnswer, correctAnswer) {
    const normalizedUser = this.normalize(userAnswer);
    const normalizedCorrect = this.normalize(correctAnswer);
    
    if (typeof normalizedUser === 'number' && typeof normalizedCorrect === 'number') {
      return Math.abs(normalizedUser - normalizedCorrect) < 0.01;
    }
    
    return normalizedUser == normalizedCorrect;
  }
}

class QuizApp {
  constructor() {
    this.dataManager = new ItemDataManager();
    this.itemRenderer = new ItemRenderer();
    this.questionGenerator = new QuestionGenerator(this.dataManager);
    this.uiController = new UIController();
    this.initialize();
  }

  async initialize() {
    await this.loadQuestionTemplates();
    this.setupEventListeners();
    this.startTimers();
    this.initializeItemsAndQuestion();
  }

  async loadQuestionTemplates() {
    try {
      const response = await fetch("q.json");
      state.questionTemplates = await response.json();
    } catch (error) {
      console.error("Error loading q.json:", error);
      alert("Could not load q.json.");
    }
  }

  setupEventListeners() {
    document
      .getElementById("questionButton")
      .addEventListener("click", () => this.generateNewQuestion());

    document
      .getElementById("answerButton")
      .addEventListener("click", () => this.uiController.showAnswer());

    document
      .getElementById("randomizeButton")
      .addEventListener("click", () => this.handleRandomize());

    document
      .getElementById("submitAnswerButton")
      .addEventListener("click", () => this.handleSubmit());

    this.uiController.elements.answerInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleSubmit();
    });
  }

  startTimers() {
    setInterval(() => this.uiController.updateTotalTime(), 1000);
  }

  initializeItemsAndQuestion() {
    this.randomizeItems();
    this.generateNewQuestion();
  }

  randomizeItems() {
    const data = this.dataManager.randomize();
    state.itemData = data;
    this.itemRenderer.render(data);
  }

  generateNewQuestion() {
    const result = this.questionGenerator.generate();
    if (result) {
      this.uiController.displayQuestion(result.question, result.answer);
      state.currentQuestionSubmitted = false;
    }
  }

  handleRandomize() {
    this.randomizeItems();
    this.generateNewQuestion();
  }

  handleSubmit() {
    if (state.currentQuestionSubmitted) return;

    const userAnswer = this.uiController.getUserAnswer();
    const isCorrect = AnswerValidator.isCorrect(
      userAnswer,
      state.currentAnswer
    );

    state.totalAttempts++;
    if (isCorrect) state.correctCount++;

    this.uiController.updateScore();
    this.uiController.showFeedback(isCorrect);

    const now = Date.now();
    if (state.lastSubmitTime) {
      const elapsedSeconds = (now - state.lastSubmitTime) / 1000;
      this.uiController.updateLastTime(elapsedSeconds);
    }
    state.lastSubmitTime = now;

    state.currentQuestionSubmitted = true;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new QuizApp());
} else {
  new QuizApp();
}