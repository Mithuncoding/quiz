const API_KEY = 'AIzaSyDeTK0P8wouQMW5kUyVU8HsU3Bp7ECtwHY';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

class QuizApp {
    constructor() {
        this.questions = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.timer = null;
        this.startTime = null;
        this.initializeElements();
        this.attachEventListeners();
        this.initializeKeyboardShortcuts();
    }

    initializeElements() {
        // Sections
        this.inputSection = document.getElementById('inputSection');
        this.quizSection = document.getElementById('quizSection');
        this.resultsSection = document.getElementById('resultsSection');
        
        // Input elements
        this.topicInput = document.getElementById('topicInput');
        this.pdfInput = document.getElementById('pdfInput');
        this.textInput = document.getElementById('textInput');
        this.generateBtn = document.getElementById('generateBtn');
        
        // Quiz elements
        this.questionNumber = document.getElementById('questionNumber');
        this.questionText = document.getElementById('question');
        this.optionsContainer = document.getElementById('options');
        this.nextBtn = document.getElementById('nextBtn');
        this.timerDisplay = document.getElementById('timer');
        
        // Results elements
        this.finalScore = document.getElementById('finalScore');
        this.timeTaken = document.getElementById('timeTaken');
        this.leaderboardList = document.getElementById('leaderboardList');
        this.restartBtn = document.getElementById('restartBtn');
        
        // Loading elements
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.progressBar = document.getElementById('progressBar');
    }

    attachEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateQuiz());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.restartBtn.addEventListener('click', () => this.restart());
        
        // Question count buttons
        document.querySelectorAll('.count-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    async generateQuiz() {
        const topic = this.topicInput.value.trim();
        const questionCount = this.getQuestionCount();
        
        if (!topic || !questionCount) {
            alert('Please enter a topic and select number of questions');
            return;
        }

        this.showLoading();
        try {
            const prompt = `Create a quiz about ${topic} with exactly ${questionCount} multiple choice questions. 
            For each question, provide exactly 4 options and indicate the correct answer.
            Format your response as a valid JSON array where each question object has this exact structure:
            {
                "question": "the question text",
                "options": ["option1", "option2", "option3", "option4"],
                "correctAnswer": "the correct option text"
            }`;

            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
                throw new Error('Invalid API response format');
            }

            const text = data.candidates[0].content.parts[0].text;
            
            // Extract JSON from the response text
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            this.questions = JSON.parse(jsonMatch[0]);
            
            if (!Array.isArray(this.questions) || this.questions.length === 0) {
                throw new Error('Invalid questions format');
            }

            // Add difficulty estimation
            this.questions = this.questions.map(q => ({
                ...q,
                difficulty: this.estimateQuestionDifficulty(q.question)
            }));
            
            // Sort questions by difficulty
            this.questions.sort((a, b) => a.difficulty - b.difficulty);
            
            this.hideLoading();
            this.startQuiz();
        } catch (error) {
            this.hideLoading();
            console.error('Error generating quiz:', error);
            alert('Failed to generate quiz. Please try again.');
        }
    }

    startQuiz() {
        this.currentQuestion = 0;
        this.score = 0;
        this.startTime = new Date();
        this.inputSection.classList.add('hidden');
        this.quizSection.classList.remove('hidden');
        this.startTimer();
        this.showQuestion();
    }

    showQuestion() {
        const question = this.questions[this.currentQuestion];
        this.questionNumber.textContent = `Question ${this.currentQuestion + 1}/${this.questions.length}`;
        this.questionText.textContent = question.question;
        this.updateProgress();
        
        this.optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option';
            button.textContent = option;
            button.addEventListener('click', () => this.checkAnswer(index));
            this.optionsContainer.appendChild(button);
        });
        
        // Hide next button until answer is selected
        this.nextBtn.style.display = 'none';
    }

    checkAnswer(selectedIndex) {
        const question = this.questions[this.currentQuestion];
        const options = this.optionsContainer.children;
        
        for (let option of options) {
            option.disabled = true;
        }

        if (question.options[selectedIndex] === question.correctAnswer) {
            options[selectedIndex].classList.add('correct');
            this.score++;
        } else {
            options[selectedIndex].classList.add('wrong');
            const correctIndex = question.options.indexOf(question.correctAnswer);
            options[correctIndex].classList.add('correct');
        }

        this.nextBtn.style.display = 'block';
    }

    nextQuestion() {
        this.currentQuestion++;
        if (this.currentQuestion < this.questions.length) {
            this.showQuestion();
            this.nextBtn.style.display = 'none';
        } else {
            this.showResults();
        }
    }

    showResults() {
        clearInterval(this.timer);
        this.quizSection.classList.add('hidden');
        
        const percentage = (this.score / this.questions.length) * 100;
        
        // Show performance animation with confetti
        const animation = document.createElement('div');
        animation.className = 'performance-animation animate__animated animate__fadeInUp';
        
        if (percentage >= 80) {
            animation.classList.add('outstanding');
            animation.innerHTML = `
                <h1>🎉 Outstanding! 🎉</h1>
                <p>You're a Quiz Master!</p>
            `;
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else if (percentage >= 60) {
            animation.classList.add('good');
            animation.innerHTML = `
                <h1>👏 Well Done! 👏</h1>
                <p>Keep up the good work!</p>
            `;
            confetti({
                particleCount: 50,
                spread: 50,
                origin: { y: 0.6 }
            });
        } else {
            animation.classList.add('low');
            animation.innerHTML = `
                <h1>💪 Keep Going! 💪</h1>
                <p>Practice makes perfect!</p>
            `;
        }
        
        document.body.appendChild(animation);
        
        // Show results after animation
        setTimeout(() => {
            animation.classList.add('animate__fadeOutDown');
            setTimeout(() => {
                animation.remove();
                this.resultsSection.classList.remove('hidden');
                
                // Update score and time
                const timeTaken = new Date() - this.startTime;
                this.finalScore.textContent = `${this.score}/${this.questions.length}`;
                this.timeTaken.textContent = this.formatTime(timeTaken);
                
                // Update leaderboard
                this.updateLeaderboard();
            }, 1000);
        }, 2000);
    }

    updateLeaderboard() {
        const topic = this.topicInput.value;
        const timeTaken = new Date() - this.startTime;
        const entry = {
            topic,
            score: this.score,
            total: this.questions.length,
            time: timeTaken,
            date: new Date().toISOString()
        };

        // Get existing leaderboard
        let leaderboard = [];
        try {
            const stored = localStorage.getItem('quizLeaderboard');
            if (stored) {
                leaderboard = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error reading leaderboard:', error);
        }

        // Add new entry
        leaderboard.push(entry);
        
        // Sort by score percentage and time
        leaderboard.sort((a, b) => {
            const scoreA = (a.score / a.total) * 100;
            const scoreB = (b.score / b.total) * 100;
            if (scoreB !== scoreA) {
                return scoreB - scoreA;
            }
            return a.time - b.time;
        });

        // Keep only top 10
        leaderboard = leaderboard.slice(0, 10);

        // Save to localStorage
        try {
            localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard));
        } catch (error) {
            console.error('Error saving leaderboard:', error);
        }

        this.displayLeaderboard(leaderboard);
    }

    displayLeaderboard(leaderboard) {
        this.leaderboardList.innerHTML = leaderboard.map((entry, index) => `
            <div class="leaderboard-item ${index < 3 ? `top-${index + 1}` : ''}">
                <div class="leaderboard-rank">
                    <span class="rank-number">#${index + 1}</span>
                    <span class="topic">${entry.topic}</span>
                </div>
                <div class="leaderboard-score">
                    <span class="score-value">${entry.score}/${entry.total}</span>
                    <span class="time-value">(${this.formatTime(entry.time)})</span>
                </div>
            </div>
        `).join('');
    }

    startTimer() {
        this.timer = setInterval(() => {
            const elapsed = new Date() - this.startTime;
            this.timerDisplay.textContent = this.formatTime(elapsed);
        }, 1000);
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }

    getQuestionCount() {
        const activeBtn = document.querySelector('.count-btn.active');
        if (activeBtn) {
            return parseInt(activeBtn.dataset.count);
        }
        const customCount = document.getElementById('customCount').value;
        return customCount ? parseInt(customCount) : null;
    }

    restart() {
        this.resultsSection.classList.add('hidden');
        this.inputSection.classList.remove('hidden');
        this.topicInput.value = '';
        document.getElementById('customCount').value = '';
        document.querySelectorAll('.count-btn').forEach(btn => btn.classList.remove('active'));
    }

    showLoading() {
        this.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    updateProgress() {
        if (this.questions.length > 0) {
            const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
            this.progressBar.style.width = `${progress}%`;
        }
    }

    estimateQuestionDifficulty(question) {
        // Simple difficulty estimation based on question length and complexity
        const length = question.length;
        const complexityMarkers = ['explain', 'analyze', 'compare', 'why', 'how'];
        const complexity = complexityMarkers.reduce((count, marker) => 
            count + (question.toLowerCase().includes(marker) ? 1 : 0), 0);
        return length * 0.1 + complexity * 2;
    }

    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (this.quizSection.classList.contains('hidden')) return;
            
            if (e.key >= '1' && e.key <= '4') {
                const index = parseInt(e.key) - 1;
                const options = this.optionsContainer.children;
                if (options[index] && !options[index].disabled) {
                    this.checkAnswer(index);
                }
            } else if (e.key === 'Enter' && this.nextBtn.style.display === 'block') {
                this.nextQuestion();
            }
        });
    }

    async handlePDFUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('pdf', file);

            // Show loading state
            this.showLoading();
            
            // Use pdf.js to extract text
            const pdfjsLib = window.pdfjsLib;
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const typedarray = new Uint8Array(e.target.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    let text = '';
                    
                    // Extract text from each page
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        text += content.items.map(item => item.str).join(' ') + '\n';
                    }
                    
                    // Limit text to 2000 words
                    const words = text.split(/\s+/);
                    this.textInput.value = words.slice(0, 2000).join(' ');
                    
                    this.hideLoading();
                } catch (error) {
                    console.error('Error reading PDF:', error);
                    alert('Error reading PDF. Please try another file.');
                    this.hideLoading();
                }
            };
            
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Error handling PDF:', error);
            alert('Error uploading PDF. Please try again.');
            this.hideLoading();
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
}); 