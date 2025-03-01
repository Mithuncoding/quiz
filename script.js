const API_KEY = 'AIzaSyA1kUgKi87qD14cUVf02B37s6qiJMMOakM';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

class QuizApp {
    constructor() {
        this.questions = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.timer = null;
        this.startTime = null;
        this.quizOptions = {
            timed: true,
            randomize: false,
            progressiveDifficulty: false,
            enableHints: false
        };
        this.skippedQuestions = [];
        this.questionResponses = [];
        this.pdfText = '';
        this.initializeElements();
        this.attachEventListeners();
        this.initializeKeyboardShortcuts();
        this.initializeTheme();
        this.initializeTabs();
        this.enhanceMobileSupport();
    }

    initializeElements() {
        // Sections
        this.inputSection = document.getElementById('inputSection');
        this.quizSection = document.getElementById('quizSection');
        this.resultsSection = document.getElementById('resultsSection');
        
        // Input elements
        this.topicField = document.getElementById('topicField');
        this.pdfFile = document.getElementById('pdfFile');
        this.customText = document.getElementById('customText');
        this.generateBtn = document.getElementById('generateBtn');
        
        // Quiz elements
        this.questionNumber = document.getElementById('questionNumber');
        this.currentQuestionNumberEl = document.getElementById('currentQuestionNumber');
        this.categoryBadge = document.getElementById('categoryBadge');
        this.questionText = document.getElementById('question');
        this.optionsContainer = document.getElementById('options');
        this.nextBtn = document.getElementById('nextBtn');
        this.skipBtn = document.getElementById('skipBtn');
        this.timerDisplay = document.getElementById('timer');
        this.progressBar = document.getElementById('progressBar');
        
        // Results elements
        this.finalScore = document.getElementById('finalScore');
        this.timeTaken = document.getElementById('timeTaken');
        this.leaderboardList = document.getElementById('leaderboardList');
        this.restartBtn = document.getElementById('restartBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.performanceChart = document.getElementById('performanceChart');
        
        // Loading elements
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.loadingText = document.getElementById('loadingText');
        this.loadingBar = document.getElementById('loadingBar');
        
        // Performance animation
        this.performanceAnimation = document.getElementById('performanceAnimation');
        this.performanceIcon = document.getElementById('performanceIcon');
        this.performanceTitle = document.getElementById('performanceTitle');
        this.performanceScore = document.getElementById('performanceScore');
        this.performanceMessage = document.getElementById('performanceMessage');
        this.continueBtn = document.getElementById('continueBtn');
        
        // UI elements
        this.themeToggle = document.getElementById('themeToggle');
        this.historyBtn = document.getElementById('historyBtn');
        this.infoBtn = document.getElementById('infoBtn');
        
        // Option cards
        this.optionTimed = document.getElementById('optionTimed');
        this.optionRandom = document.getElementById('optionRandom');
        this.optionDifficulty = document.getElementById('optionDifficulty');
        this.optionHints = document.getElementById('optionHints');
        
        // Tab elements
        this.topicTab = document.getElementById('topicTab');
        this.pdfTab = document.getElementById('pdfTab');
        this.textTab = document.getElementById('textTab');
        this.tabIndicator = document.querySelector('.tab-indicator');
        
        // PDF elements
        this.pdfPreview = document.getElementById('pdfPreview');
        this.pdfFileName = document.getElementById('pdfFileName');
        this.pdfRemove = document.getElementById('pdfRemove');
        
        // Input wrappers
        this.topicInputWrapper = document.getElementById('topicInput');
        this.pdfInputWrapper = document.getElementById('pdfInput');
        this.textInputWrapper = document.getElementById('textInput');
    }

    attachEventListeners() {
        // Main buttons
        this.generateBtn.addEventListener('click', () => this.generateQuiz());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.skipBtn.addEventListener('click', () => this.skipQuestion());
        this.restartBtn.addEventListener('click', () => this.restart());
        this.shareBtn.addEventListener('click', () => this.shareResults());
        this.continueBtn.addEventListener('click', () => this.hidePerformanceAnimation());
        
        // UI controls
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.historyBtn.addEventListener('click', () => this.showHistory());
        this.infoBtn.addEventListener('click', () => this.showInfo());
        
        // Option cards
        this.optionTimed.addEventListener('click', () => this.toggleOption('timed', this.optionTimed));
        this.optionRandom.addEventListener('click', () => this.toggleOption('randomize', this.optionRandom));
        this.optionDifficulty.addEventListener('click', () => this.toggleOption('progressiveDifficulty', this.optionDifficulty));
        this.optionHints.addEventListener('click', () => this.toggleOption('enableHints', this.optionHints));
        
        // Tabs
        this.topicTab.addEventListener('click', () => this.switchTab('topic', 0));
        this.pdfTab.addEventListener('click', () => this.switchTab('pdf', 1));
        this.textTab.addEventListener('click', () => this.switchTab('text', 2));
        
        // PDF handling
        this.pdfFile.addEventListener('change', (e) => this.handlePDFUpload(e));
        this.pdfRemove.addEventListener('click', () => this.removePDF());
        
        // Question count buttons
        document.querySelectorAll('.count-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('customCount').value = '';
            });
        });
        
        // Custom count field
        document.getElementById('customCount').addEventListener('input', (e) => {
            if (e.target.value) {
                document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
            }
        });
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('quizTheme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('quizTheme', newTheme);
        
        // Add a nice transition effect
        document.body.style.opacity = '0.9';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 150);
    }

    initializeTabs() {
        // Position tab indicator at initial position (topic tab)
        this.moveTabIndicator(0);
    }

    moveTabIndicator(tabIndex) {
        const positions = [0, 33.33, 66.66];
        this.tabIndicator.style.left = `${positions[tabIndex]}%`;
    }

    switchTab(tabName, tabIndex) {
        // Update tab buttons
        [this.topicTab, this.pdfTab, this.textTab].forEach(tab => tab.classList.remove('active'));
        
        // Show corresponding input and hide others
        this.topicInputWrapper.classList.add('hidden');
        this.pdfInputWrapper.classList.add('hidden');
        this.textInputWrapper.classList.add('hidden');
        
        switch(tabName) {
            case 'topic':
                this.topicTab.classList.add('active');
                this.topicInputWrapper.classList.remove('hidden');
                break;
            case 'pdf':
                this.pdfTab.classList.add('active');
                this.pdfInputWrapper.classList.remove('hidden');
                break;
            case 'text':
                this.textTab.classList.add('active');
                this.textInputWrapper.classList.remove('hidden');
                break;
        }
        
        // Move the indicator
        this.moveTabIndicator(tabIndex);
    }

    toggleOption(option, element) {
        this.quizOptions[option] = !this.quizOptions[option];
        
        if (this.quizOptions[option]) {
            element.classList.add('selected');
            element.querySelector('.option-icon').innerHTML = '<i class="fas fa-check"></i>';
        } else {
            element.classList.remove('selected');
            element.querySelector('.option-icon').innerHTML = '';
        }
    }

    async handlePDFUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Add this check for mobile devices with limited memory
        const isMobile = window.innerWidth <= 768;
        const maxSizeForMobile = 5 * 1024 * 1024; // 5MB for mobile
        
        if (isMobile && file.size > maxSizeForMobile) {
            alert('File is too large for mobile processing. Please use a smaller PDF (under 5MB) or try on desktop.');
            this.pdfFile.value = '';
            return;
        }

        try {
            this.showLoading('Processing PDF...');
            this.updateLoadingBar(10);
            
            // Use pdf.js to extract text
            const pdfjsLib = window.pdfjsLib;
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const typedarray = new Uint8Array(e.target.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    let text = '';
                    
                    // Extract text from each page with progress updates
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        text += content.items.map(item => item.str).join(' ') + '\n';
                        
                        // Update loading progress
                        const progress = 10 + Math.round((i / pdf.numPages) * 80);
                        this.updateLoadingBar(progress);
                    }
                    
                    // Limit text to 5000 words
                    const words = text.split(/\s+/);
                    this.pdfText = words.slice(0, 5000).join(' ');
                    
                    this.updateLoadingBar(100);
                    setTimeout(() => this.hideLoading(), 500);
                    
                    // Show file preview
                    this.pdfFileName.textContent = file.name;
                    this.pdfPreview.classList.remove('hidden');
                    
                } catch (error) {
                    console.error('Error reading PDF:', error);
                    alert('Error reading PDF. Please try another file.');
                    this.pdfFile.value = '';
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

    removePDF() {
        this.pdfFile.value = '';
        this.pdfPreview.classList.add('hidden');
        this.pdfText = '';
    }

    async generateQuiz() {
        let content = '';
        let contentType = '';
        
        // Determine which input method is being used
        if (!this.topicInputWrapper.classList.contains('hidden')) {
            content = this.topicField.value.trim();
            contentType = 'topic';
            
            if (!content) {
                this.showError('Please enter a topic for your quiz');
                return;
            }
        } else if (!this.pdfInputWrapper.classList.contains('hidden')) {
            content = this.pdfText;
            contentType = 'pdf';
            
            if (!content) {
                this.showError('Please upload a PDF document');
                return;
            }
        } else if (!this.textInputWrapper.classList.contains('hidden')) {
            content = this.customText.value.trim();
            contentType = 'text';
            
            if (!content) {
                this.showError('Please enter some text for your quiz');
                return;
            }
        }
        
        const questionCount = this.getQuestionCount();
        
        if (!questionCount) {
            this.showError('Please select the number of questions');
            return;
        }

        this.showLoading('Generating your quiz...');
        this.updateLoadingBar(10);
        
        try {
            let prompt;
            
            if (contentType === 'topic') {
                prompt = `Create a quiz about "${content}" with exactly ${questionCount} multiple choice questions. 
                For each question, provide exactly 4 options and indicate the correct answer.
                Also include a difficulty level (easy, medium, or hard) for each question.
                Format your response as a valid JSON array where each question object has this exact structure:
                {
                    "question": "the question text",
                    "options": ["option1", "option2", "option3", "option4"],
                    "correctAnswer": "the correct option exactly as written in options",
                    "difficulty": "easy|medium|hard",
                    "category": "subject area of this question"
                }`;
            } else {
                prompt = `Create a quiz based on the following content with exactly ${questionCount} multiple choice questions. 
                For each question, provide exactly 4 options and indicate the correct answer.
                Also include a difficulty level (easy, medium, or hard) for each question.
                Format your response as a valid JSON array where each question object has this exact structure:
                {
                    "question": "the question text",
                    "options": ["option1", "option2", "option3", "option4"],
                    "correctAnswer": "the correct option exactly as written in options",
                    "difficulty": "easy|medium|hard",
                    "category": "subject area of this question"
                }
                
                Content: ${content.slice(0, 5000)}`;
            }

            this.updateLoadingBar(30);
            this.loadingText.textContent = 'Creating challenging questions...';

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

            this.updateLoadingBar(60);
            this.loadingText.textContent = 'Processing quiz data...';

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

            this.updateLoadingBar(80);
            this.loadingText.textContent = 'Finalizing your quiz...';

            this.questions = JSON.parse(jsonMatch[0]);
            
            if (!Array.isArray(this.questions) || this.questions.length === 0) {
                throw new Error('Invalid questions format');
            }

            // Process questions based on options
            if (this.quizOptions.randomize) {
                this.shuffleQuestions();
            } else if (this.quizOptions.progressiveDifficulty) {
                this.sortQuestionsByDifficulty();
            }
            
            this.updateLoadingBar(100);
            setTimeout(() => {
                this.hideLoading();
                this.startQuiz();
            }, 500);
            
        } catch (error) {
            this.hideLoading();
            console.error('Error generating quiz:', error);
            this.showError('Failed to generate quiz. Please try again.');
        }
    }

    sortQuestionsByDifficulty() {
        const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
        this.questions.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    }

    shuffleQuestions() {
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
    }

    startQuiz() {
        this.currentQuestion = 0;
        this.score = 0;
        this.startTime = new Date();
        this.inputSection.classList.add('hidden');
        this.quizSection.classList.remove('hidden');
        
        // Hide the sidebar when starting the quiz
        document.querySelector('.container').classList.add('quiz-active');
        
        this.startTimer();
        this.showQuestion();
    }

    showQuestion() {
        const question = this.questions[this.currentQuestion];
        const totalQuestions = this.questions.length;
        
        // Update question header
        this.questionNumber.textContent = `Question ${this.currentQuestion + 1}/${totalQuestions}`;
        this.currentQuestionNumberEl.textContent = this.currentQuestion + 1;
        
        // Update category badge if available
        if (question.category) {
            this.categoryBadge.textContent = question.category;
            this.categoryBadge.classList.remove('hidden');
        } else {
            this.categoryBadge.classList.add('hidden');
        }
        
        // Update difficulty indicators
        const difficultyDots = document.querySelectorAll('.difficulty-dot');
        difficultyDots.forEach(dot => dot.classList.remove('active'));
        
        const difficultyLevel = question.difficulty || 'medium';
        let dotsToActivate = 0;
        
        switch(difficultyLevel) {
            case 'easy': dotsToActivate = 1; break;
            case 'medium': dotsToActivate = 2; break;
            case 'hard': dotsToActivate = 3; break;
            default: dotsToActivate = 2;
        }
        
        for (let i = 0; i < dotsToActivate; i++) {
            difficultyDots[i].classList.add('active');
        }
        
        // Set question text
        this.questionText.textContent = question.question;
        
        // Update progress
        this.updateProgress();
        
        // Generate options
        this.optionsContainer.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D'];
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            
            optionElement.innerHTML = `
                <span class="option-letter">${letters[index]}</span>
                ${option}
                <span class="option-feedback"></span>
            `;
            
            optionElement.addEventListener('click', () => this.checkAnswer(index));
            this.optionsContainer.appendChild(optionElement);
        });
        
        // Reset button states
        this.nextBtn.classList.add('hidden');
        this.skipBtn.classList.remove('hidden');
    }

    checkAnswer(selectedIndex) {
        const question = this.questions[this.currentQuestion];
        const options = this.optionsContainer.children;
        const selectedOption = options[selectedIndex];
        let isCorrect = false;
        
        // Disable all options
        for (let option of options) {
            option.classList.add('disabled');
            option.style.pointerEvents = 'none';
        }
        
        // Check if answer is correct
        if (question.options[selectedIndex] === question.correctAnswer) {
            selectedOption.classList.add('correct');
            selectedOption.querySelector('.option-feedback').textContent = 'Correct!';
            this.score++;
            isCorrect = true;
        } else {
            // Find correct answer
            selectedOption.classList.add('wrong');
            selectedOption.querySelector('.option-feedback').textContent = 'Incorrect';
            
            const correctIndex = question.options.findIndex(opt => opt === question.correctAnswer);
            if (correctIndex !== -1) {
                options[correctIndex].classList.add('correct');
                options[correctIndex].querySelector('.option-feedback').textContent = 'Correct Answer';
            }
        }
        
        // Save response data
        this.questionResponses.push({
            question: question.question,
            userAnswer: question.options[selectedIndex],
            correctAnswer: question.correctAnswer,
            isCorrect: isCorrect,
            timeSpent: new Date() - this.startTime - this.getTotalResponseTime(),
            difficulty: question.difficulty || 'medium'
        });
        
        // Show next button, hide skip button
        this.nextBtn.classList.remove('hidden');
        this.skipBtn.classList.add('hidden');
    }

    getTotalResponseTime() {
        return this.questionResponses.reduce((total, response) => total + response.timeSpent, 0);
    }

    skipQuestion() {
        this.skippedQuestions.push(this.currentQuestion);
        this.nextQuestion();
    }

    nextQuestion() {
        this.currentQuestion++;
        
        // Check if all questions have been answered or skipped
        if (this.currentQuestion < this.questions.length) {
            this.showQuestion();
        } else if (this.skippedQuestions.length > 0 && this.questionResponses.length < this.questions.length) {
            // If there are skipped questions, go back to the first skipped question
            this.currentQuestion = this.skippedQuestions.shift();
            this.showQuestion();
        } else {
            // End quiz if all questions have been answered
            this.endQuiz();
        }
    }

    endQuiz() {
        clearInterval(this.timer);
        this.quizSection.classList.add('hidden');
        
        const quizDuration = new Date() - this.startTime;
        const scorePercentage = Math.round((this.score / this.questions.length) * 100);
        
        // Show performance animation
        this.showPerformanceAnimation(scorePercentage);
    }

    showPerformanceAnimation(scorePercentage) {
        // Set animation content based on score
        let icon, title, message;
        
        if (scorePercentage >= 80) {
            icon = '🎉';
            title = 'Outstanding!';
            message = 'You\'re a Quiz Master!';
            confetti({
                particleCount: this.isMobile ? 50 : 100,
                spread: this.isMobile ? 50 : 70,
                origin: { y: 0.6 }
            });
        } else if (scorePercentage >= 60) {
            icon = '👍';
            title = 'Good Job!';
            message = 'Keep practicing to improve!';
        } else if (scorePercentage >= 40) {
            icon = '💪';
            title = 'Keep Going!';
            message = 'Learning takes time. Keep practicing!';
        } else {
            icon = '📚';
            title = 'Keep Learning!';
            message = 'Don\'t give up! You\'ll get better with practice.';
        }
        
        // Update the performance animation elements
        this.performanceIcon.textContent = icon;
        this.performanceTitle.textContent = title;
        this.performanceScore.textContent = `${Math.round(scorePercentage)}%`;
        this.performanceMessage.textContent = message;
        
        // Show the animation
        this.performanceAnimation.classList.remove('hidden');
    }

    hidePerformanceAnimation() {
        // Hide the animation
        this.performanceAnimation.classList.add('hidden');
        
        // Show the results section
        this.resultsSection.classList.remove('hidden');
        
        // Create and display performance chart
        this.createPerformanceChart();
        
        // Update leaderboard with latest result
        this.updateLeaderboard();
    }

    showResults() {
        clearInterval(this.timer);
        this.quizSection.classList.add('hidden');
        
        // Keep the sidebar hidden during results
        document.querySelector('.container').classList.add('quiz-active');
        
        const percentage = Math.round((this.score / this.questions.length) * 100);
        const quizDuration = new Date() - this.startTime;
        
        // Update score and time display
        this.finalScore.textContent = `${percentage}%`;
        this.timeTaken.textContent = this.formatTime(quizDuration);
        
        // Show performance animation instead of immediately showing results
        this.showPerformanceAnimation(percentage);
    }

    createPerformanceChart() {
        if (this.performanceChart) {
            // Clear any existing chart
            if (this.chartInstance) {
                this.chartInstance.destroy();
            }
            
            // Prepare chart data
            const correctCount = this.score;
            const incorrectCount = this.questions.length - this.score;
            
            // Add responsive options for mobile
            const isMobile = window.innerWidth <= 768;
            
            // Create chart
            this.chartInstance = new Chart(this.performanceChart, {
                type: 'doughnut',
                data: {
                    labels: ['Correct', 'Incorrect'],
                    datasets: [{
                        data: [correctCount, incorrectCount],
                        backgroundColor: [
                            getComputedStyle(document.documentElement).getPropertyValue('--correct-color'),
                            getComputedStyle(document.documentElement).getPropertyValue('--wrong-color')
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: isMobile ? 'top' : 'bottom',
                            labels: {
                                boxWidth: isMobile ? 12 : 20,
                                padding: isMobile ? 10 : 20,
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                            }
                        }
                    }
                }
            });
        }
    }

    updateLeaderboard() {
        const topic = this.topicField.value.trim() || 'Custom Quiz';
        const quizDuration = new Date() - this.startTime;
        const scorePercentage = Math.round((this.score / this.questions.length) * 100);
        
        const entry = {
            topic: topic,
            score: scorePercentage,
            time: quizDuration,
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
        
        // Sort by score and time
        leaderboard.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.time - b.time;
        });

        // Keep only top 10
        leaderboard = leaderboard.slice(0, 10);

        // Save to localStorage
        localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard));

        // Display leaderboard
        this.displayLeaderboard(leaderboard);
    }

    displayLeaderboard(leaderboard) {
        this.leaderboardList.innerHTML = leaderboard.map((entry, index) => `
            <div class="leaderboard-item">
                <div class="leaderboard-rank">
                    <div class="rank-number">${index + 1}</div>
                    <div class="topic">${entry.topic}</div>
                </div>
                <div class="leaderboard-score">
                    <div class="score-value">${entry.score}%</div>
                    <div class="time-value">(${this.formatTime(entry.time)})</div>
                </div>
            </div>
        `).join('');
    }

    shareResults() {
        const scorePercentage = Math.round((this.score / this.questions.length) * 100);
        const quizDuration = new Date() - this.startTime;
        const formattedTime = this.formatTime(quizDuration);
        const topic = this.topicField.value.trim() || 'Custom Quiz';
        
        const shareText = `🎯 I scored ${scorePercentage}% on "${topic}" quiz in ${formattedTime} using QuizGenius! Can you beat my score? #QuizGenius`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My QuizGenius Results',
                text: shareText,
                url: window.location.href
            }).catch(err => {
                console.error('Share failed:', err);
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }

    fallbackShare(text) {
        // Create a temporary input to copy the text
        const input = document.createElement('textarea');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        
        alert('Result copied to clipboard! Share it with your friends.');
    }

    showHistory() {
        // Get stored quizzes
        let history = [];
        try {
            const stored = localStorage.getItem('quizLeaderboard');
            if (stored) {
                history = JSON.parse(stored);
                
                if (history.length === 0) {
                    alert('You haven\'t taken any quizzes yet!');
                    return;
                }
                
                const historyText = history.map((entry, index) => 
                    `${index + 1}. "${entry.topic}" - Score: ${entry.score}% (${this.formatTime(entry.time)})`
                ).join('\n');
                
                alert('Your Quiz History:\n\n' + historyText);
            } else {
                alert('You haven\'t taken any quizzes yet!');
            }
        } catch (error) {
            console.error('Error reading quiz history:', error);
            alert('Error loading quiz history.');
        }
    }

    showInfo() {
        alert('QuizGenius - AI-Powered Quiz Generator\n\n' + 
              'Create custom quizzes on any topic using AI technology.\n\n' +
              'Features:\n' +
              '- Generate quizzes from topics, PDFs, or text\n' +
              '- Customize quiz settings\n' +
              '- Track your performance\n' +
              '- Compare with other attempts\n\n' +
              'Made with 💜 by QuizGenius Team');
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
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
        }
    }

    getQuestionCount() {
        const activeBtn = document.querySelector('.count-btn.active');
        if (activeBtn) {
            return parseInt(activeBtn.dataset.count);
        }
        
        const customCount = document.getElementById('customCount').value;
        if (customCount) {
            const count = parseInt(customCount);
            return count > 0 && count <= 50 ? count : null;
        }
        
        return null;
    }

    restart() {
        this.resultsSection.classList.add('hidden');
        this.inputSection.classList.remove('hidden');
        
        // Show the sidebar again when returning to the input section
        document.querySelector('.container').classList.remove('quiz-active');
        
        // Clear input fields
        this.topicField.value = '';
        this.customText.value = '';
        this.removePDF();
        
        // Reset to topic tab
        this.switchTab('topic', 0);
    }

    showLoading(message = 'Loading...') {
        this.loadingText.textContent = message;
        this.loadingBar.style.width = '0%';
        this.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    updateLoadingBar(percentage) {
        this.loadingBar.style.width = `${percentage}%`;
    }

    updateProgress() {
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        this.progressBar.style.width = `${progress}%`;
    }

    showError(message) {
        alert(message);
    }

    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (this.quizSection.classList.contains('hidden')) return;
            
            if (e.key >= '1' && e.key <= '4') {
                const index = parseInt(e.key) - 1;
                const options = this.optionsContainer.children;
                if (options[index] && !options[index].classList.contains('disabled')) {
                    this.checkAnswer(index);
                }
            } else if (e.key === 'Enter' || e.key === ' ') {
                if (!this.nextBtn.classList.contains('hidden')) {
                    this.nextQuestion();
                    e.preventDefault();
                }
            } else if (e.key === 's' || e.key === 'S') {
                if (!this.skipBtn.classList.contains('hidden')) {
                    this.skipQuestion();
                    e.preventDefault();
                }
            }
        });
    }

    // Enhance mobile touch support
    enhanceMobileSupport() {
        // Add active state for touch feedback
        const touchElements = document.querySelectorAll('.option, .option-card, .count-btn, .nav-btn, .tab-btn');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            }, { passive: true });
            
            element.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            }, { passive: true });
            
            element.addEventListener('touchcancel', function() {
                this.classList.remove('touch-active');
            }, { passive: true });
        });
        
        // Fix iOS Safari 100vh issue
        const appHeight = () => {
            const doc = document.documentElement;
            doc.style.setProperty('--app-height', `${window.innerHeight}px`);
        };
        
        window.addEventListener('resize', appHeight);
        appHeight();
        
        // Add fastclick to remove 300ms delay on mobile browsers
        if ('ontouchstart' in window) {
            document.addEventListener('touchstart', function(){}, {passive: true});
        }
    }

    // Modify the constructor to include mobile support
    constructor() {
        // Existing code...
        this.initializeElements();
        this.attachEventListeners();
        this.initializeKeyboardShortcuts();
        this.initializeTheme();
        this.initializeTabs();
        this.enhanceMobileSupport(); // Add mobile optimizations
    }

    // Improve PDF handling for mobile
    async handlePDFUpload(event) {
        // Existing code...
        
        try {
            // Add this check for mobile devices with limited memory
            const isMobile = window.innerWidth <= 768;
            const maxSizeForMobile = 5 * 1024 * 1024; // 5MB for mobile
            
            if (isMobile && file.size > maxSizeForMobile) {
                alert('File is too large for mobile processing. Please use a smaller PDF (under 5MB) or try on desktop.');
                this.pdfFile.value = '';
                return;
            }
            
            // Rest of the existing code...
        } catch (error) {
            // Error handling...
        }
    }

    // Make the performance animation more mobile-friendly
    showPerformanceAnimation(scorePercentage) {
        // Existing code...
        
        // Make confetti mobile-friendly
        const isMobile = window.innerWidth <= 768;
        if (scorePercentage >= 80) {
            // Reduce particle count on mobile
            confetti({
                particleCount: isMobile ? 50 : 100,
                spread: isMobile ? 50 : 70,
                origin: { y: 0.6 }
            });
        }
        
        // Rest of existing code...
    }

    // Optimize chart rendering for mobile
    createPerformanceChart() {
        if (this.performanceChart) {
            // Existing code...
            
            // Add responsive options for mobile
            const isMobile = window.innerWidth <= 768;
            
            this.chartInstance = new Chart(this.performanceChart, {
                // Existing configuration...
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: isMobile ? 'top' : 'bottom',
                            labels: {
                                boxWidth: isMobile ? 12 : 20,
                                padding: isMobile ? 10 : 20,
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                            }
                        }
                    }
                }
            });
        }
    }
}

// Initialize the app when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
}); 
