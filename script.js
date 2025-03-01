<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuizGenius - AI-Powered Quiz Generator</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.6.172/pdf.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="container">
        <div class="app-sidebar">
            <div class="sidebar-logo">
                <h1>QuizGenius</h1>
                <p>AI-Powered Quiz Generator</p>
            </div>
            
            <div class="question-count">
                <h3>Number of Questions</h3>
                <div class="count-options">
                    <button class="count-btn active" data-count="10">10</button>
                    <button class="count-btn" data-count="15">15</button>
                    <button class="count-btn" data-count="20">20</button>
                    <button class="count-btn" data-count="25">25</button>
                </div>
                <div class="custom-count-wrapper">
                    <input type="number" id="customCount" placeholder="Custom" min="1" max="50">
                </div>
            </div>
        </div>
        
        <div class="app-content">
            <div class="loading-overlay hidden" id="loadingOverlay">
                <div class="spinner"></div>
                <p class="loading-text" id="loadingText">Generating your quiz...</p>
                <div class="loading-progress">
                    <div class="loading-bar" id="loadingBar"></div>
                </div>
            </div>

            <div class="performance-animation hidden" id="performanceAnimation">
                <div class="performance-card">
                    <div class="performance-icon" id="performanceIcon">🎉</div>
                    <h2 class="performance-title" id="performanceTitle">Outstanding!</h2>
                    <div class="performance-score" id="performanceScore">90%</div>
                    <p class="performance-message" id="performanceMessage">You're a Quiz Master!</p>
                    <button class="performance-btn" id="continueBtn">Continue</button>
                </div>
            </div>

            <div class="app-header">
                <h1>Create Your Quiz</h1>
                <div class="app-nav">
                    <button class="nav-btn" id="historyBtn" title="Quiz History">
                        <i class="fas fa-history"></i>
                    </button>
                    <button class="nav-btn" id="infoBtn" title="About">
                        <i class="fas fa-info-circle"></i>
                    </button>
                    <div class="theme-toggle" id="themeToggle" title="Switch Theme"></div>
                </div>
            </div>

            <div class="input-section" id="inputSection">
                <div class="tabs">
                    <button class="tab-btn active" id="topicTab">Topic</button>
                    <button class="tab-btn" id="pdfTab">PDF Upload</button>
                    <button class="tab-btn" id="textTab">Custom Text</button>
                    <div class="tab-indicator"></div>
                </div>
                
                <div class="input-group">
                    <div class="input-wrapper" id="topicInput">
                        <input type="text" id="topicField" placeholder="Enter a topic for your quiz">
                        <i class="fas fa-lightbulb input-icon"></i>
                    </div>
                    
                    <div class="input-wrapper hidden" id="pdfInput">
                        <div class="file-upload">
                            <label for="pdfFile" class="file-upload-label">
                                <i class="fas fa-file-pdf"></i>
                                Upload PDF Document
                            </label>
                            <p class="file-upload-info">Supported format: PDF (max 10MB)</p>
                            <input type="file" id="pdfFile" accept=".pdf">
                        </div>
                        <div class="file-preview hidden" id="pdfPreview">
                            <i class="fas fa-file-pdf file-preview-icon"></i>
                            <span class="file-preview-name" id="pdfFileName">document.pdf</span>
                            <button class="file-preview-remove" id="pdfRemove">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="input-wrapper hidden" id="textInput">
                        <textarea id="customText" placeholder="Paste your text here (up to 2000 words)" rows="6"></textarea>
                    </div>
                </div>
                
                <div class="quiz-options">
                    <h3>Quiz Settings</h3>
                    <div class="options-grid">
                        <div class="option-card selected" id="optionTimed">
                            <div class="option-icon">
                                <i class="fas fa-check"></i>
                            </div>
                            <div class="option-text">Timed Quiz</div>
                        </div>
                        <div class="option-card" id="optionRandom">
                            <div class="option-icon"></div>
                            <div class="option-text">Randomize Questions</div>
                        </div>
                        <div class="option-card" id="optionDifficulty">
                            <div class="option-icon"></div>
                            <div class="option-text">Progressive Difficulty</div>
                        </div>
                        <div class="option-card" id="optionHints">
                            <div class="option-icon"></div>
                            <div class="option-text">Enable Hints</div>
                        </div>
                    </div>
                </div>
                
                <button id="generateBtn" class="generate-btn">
                    <i class="fas fa-magic"></i>
                    Generate Quiz
                </button>
            </div>

            <div class="quiz-section hidden" id="quizSection">
                <div class="quiz-header">
                    <div class="quiz-info">
                        <h2 id="questionNumber">Question 1/10</h2>
                        <span class="badge badge-primary" id="categoryBadge">Science</span>
                    </div>
                    <div class="timer">
                        <i class="fas fa-clock timer-icon"></i>
                        <span id="timer">00:00</span>
                    </div>
                </div>
                
                <div class="progress-bar">
                    <div class="progress" id="progressBar"></div>
                </div>
                
                <div class="question-container">
                    <div class="question-number">
                        Question <span id="currentQuestionNumber">1</span>
                        <div class="question-difficulty">
                            <div class="difficulty-dot active"></div>
                            <div class="difficulty-dot active"></div>
                            <div class="difficulty-dot"></div>
                        </div>
                    </div>
                    <p id="question">What is the process by which plants convert light energy into chemical energy?</p>
                    <div class="options" id="options">
                        <div class="option">
                            <span class="option-letter">A</span>
                            Photosynthesis
                            <span class="option-feedback">Correct!</span>
                        </div>
                        <div class="option">
                            <span class="option-letter">B</span>
                            Respiration
                            <span class="option-feedback">Not quite!</span>
                        </div>
                        <div class="option">
                            <span class="option-letter">C</span>
                            Transpiration
                            <span class="option-feedback">Try again!</span>
                        </div>
                        <div class="option">
                            <span class="option-letter">D</span>
                            Germination
                            <span class="option-feedback">Incorrect!</span>
                        </div>
                    </div>
                </div>
                
                <div class="next-btn-container">
                    <button class="skip-btn" id="skipBtn">
                        <i class="fas fa-forward"></i> Skip
                    </button>
                    <button id="nextBtn" class="next-btn hidden">
                        <i class="fas fa-arrow-right"></i> Next Question
                    </button>
                </div>
            </div>

            <div class="results-section hidden" id="resultsSection">
                <h2>Quiz Results</h2>
                
                <div class="score-grid">
                    <div class="score-card">
                        <i class="fas fa-trophy"></i>
                        <div class="score-value" id="finalScore">85%</div>
                        <div class="score-label">Accuracy</div>
                    </div>
                    <div class="score-card time-card">
                        <i class="fas fa-stopwatch"></i>
                        <div class="score-value" id="timeTaken">03:45</div>
                        <div class="score-label">Time Taken</div>
                    </div>
                </div>
                
                <div class="performance-summary">
                    <h3 class="summary-title">
                        <i class="fas fa-chart-line"></i>
                        Performance Analysis
                    </h3>
                    <div class="summary-chart" id="performanceChart"></div>
                </div>
                
                <div class="leaderboard">
                    <h3>
                        <i class="fas fa-medal"></i>
                        Leaderboard
                    </h3>
                    <div id="leaderboardList">
                        <div class="leaderboard-item">
                            <div class="leaderboard-rank">
                                <div class="rank-number">1</div>
                                <div class="topic">Quantum Physics</div>
                            </div>
                            <div class="leaderboard-score">
                                <div class="score-value">95%</div>
                                <div class="time-value">(02:15)</div>
                            </div>
                        </div>
                        <div class="leaderboard-item">
                            <div class="leaderboard-rank">
                                <div class="rank-number">2</div>
                                <div class="topic">World History</div>
                            </div>
                            <div class="leaderboard-score">
                                <div class="score-value">90%</div>
                                <div class="time-value">(03:10)</div>
                            </div>
                        </div>
                        <div class="leaderboard-item">
                            <div class="leaderboard-rank">
                                <div class="rank-number">3</div>
                                <div class="topic">Computer Science</div>
                            </div>
                            <div class="leaderboard-score">
                                <div class="score-value">85%</div>
                                <div class="time-value">(02:45)</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <button id="restartBtn" class="restart-btn">
                        <i class="fas fa-redo"></i>
                        New Quiz
                    </button>
                    <button class="share-btn" id="shareBtn">
                        <i class="fas fa-share-alt"></i>
                        Share Results
                    </button>
                </div>
            </div>

            <!-- Move the footer here inside app-content -->
            <footer class="copyright-footer">
                <p>&copy; 2023 QuizGenius. Designed by Mithun R</p>
            </footer>
        </div>
    </div>
    
    <script src="script.js"></script>
</body>
</html> 
