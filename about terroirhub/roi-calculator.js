// ROI計算機能
class ROICalculator {
    constructor() {
        this.initializeEventListeners();
        this.constants = {
            purchaseRate: 0.15,          // 購入率15%
            improvementRateMin: 0.18,    // 最小改善率18%
            improvementRateMax: 0.30,    // 最大改善率30%
            avgContractValue: 500000,    // 平均成約額50万円
            contractImprovement: 0.30,   // 成約率向上30%
            serviceFee: {
                lite: 300000,
                standard: 500000,
                premium: 1000000
            }
        };
    }

    initializeEventListeners() {
        const form = document.getElementById('roiForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateROI();
        });

        // リアルタイム計算（オプション）
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (this.areAllFieldsFilled()) {
                    this.calculateROI();
                }
            });
        });

        // メール送信ボタン
        const emailBtn = document.querySelector('.email-btn');
        emailBtn.addEventListener('click', () => {
            this.handleEmailSubmission();
        });
    }

    areAllFieldsFilled() {
        const visitors = document.getElementById('visitors').value;
        const avgPrice = document.getElementById('avgPrice').value;
        const events = document.getElementById('events').value;
        
        return visitors && avgPrice && events;
    }

    calculateROI() {
        // 入力値を取得
        const visitors = parseInt(document.getElementById('visitors').value) || 0;
        const avgPrice = parseInt(document.getElementById('avgPrice').value) || 0;
        const events = parseInt(document.getElementById('events').value) || 0;

        if (visitors <= 0 || avgPrice <= 0) {
            alert('正しい数値を入力してください');
            return;
        }

        // 基準売上計算
        const baseSales = visitors * avgPrice * this.constants.purchaseRate;
        
        // 改善後売上計算（中間値を使用）
        const improvementRate = (this.constants.improvementRateMin + this.constants.improvementRateMax) / 2;
        const improvedSales = baseSales * (1 + improvementRate);
        
        // 展示会効果
        const eventImprovement = events * this.constants.avgContractValue * this.constants.contractImprovement;
        
        // 総改善額
        const totalImprovement = (improvedSales - baseSales) + eventImprovement;
        const totalImprovedSales = baseSales + totalImprovement;

        // ROI計算（スタンダードプランベース）
        const roi = this.calculatePaybackPeriod(totalImprovement, this.constants.serviceFee.standard);

        // 結果を表示
        this.displayResults({
            currentSales: baseSales,
            improvedSales: totalImprovedSales,
            improvement: totalImprovement,
            roi: roi
        });

        // アニメーション付きグラフを表示
        this.animateChart(baseSales, totalImprovedSales);
    }

    calculatePaybackPeriod(improvement, serviceFee) {
        const monthlyImprovement = improvement / 12;
        const paybackMonths = Math.ceil(serviceFee / monthlyImprovement);
        return paybackMonths;
    }

    displayResults(results) {
        // 結果コンテナを表示
        const resultsContainer = document.getElementById('results');
        resultsContainer.classList.add('show');

        // 数値を表示
        document.getElementById('currentSales').textContent = this.formatCurrency(results.currentSales);
        document.getElementById('improvedSales').textContent = this.formatCurrency(results.improvedSales);
        document.getElementById('improvement').textContent = this.formatCurrency(results.improvement);
        document.getElementById('roi').textContent = `${results.roi}ヶ月`;

        // スクロールして結果セクションへ
        resultsContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }

    animateChart(currentSales, improvedSales) {
        const maxValue = Math.max(currentSales, improvedSales);
        const currentBar = document.getElementById('currentBar');
        const improvedBar = document.getElementById('improvedBar');
        const currentValueEl = document.getElementById('currentValue');
        const improvedValueEl = document.getElementById('improvedValue');

        // バーの高さを計算（最大180px）
        const currentHeight = (currentSales / maxValue) * 180;
        const improvedHeight = (improvedSales / maxValue) * 180;

        // アニメーションで高さを変更
        setTimeout(() => {
            currentBar.style.height = `${currentHeight}px`;
            improvedBar.style.height = `${improvedHeight}px`;
            
            // 値を表示
            currentValueEl.textContent = this.formatCurrency(currentSales);
            improvedValueEl.textContent = this.formatCurrency(improvedSales);
        }, 300);

        // カウンターアニメーション
        this.animateCounter(currentValueEl, 0, currentSales, 1000);
        this.animateCounter(improvedValueEl, 0, improvedSales, 1500);
    }

    animateCounter(element, start, end, duration) {
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // easeOutQuart イージング
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const current = start + (end - start) * easeProgress;
            
            element.textContent = this.formatCurrency(Math.floor(current));
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = this.formatCurrency(end);
            }
        };
        
        requestAnimationFrame(updateCounter);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    handleEmailSubmission() {
        const emailInput = document.querySelector('.email-input');
        const email = emailInput.value.trim();
        
        if (!email) {
            alert('メールアドレスを入力してください');
            return;
        }

        if (!this.isValidEmail(email)) {
            alert('正しいメールアドレスを入力してください');
            return;
        }

        // 計算結果を取得
        const results = this.getCurrentResults();
        
        // メール送信処理（実際の実装では適切なAPIエンドポイントに送信）
        this.sendEmail(email, results);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getCurrentResults() {
        return {
            visitors: document.getElementById('visitors').value,
            avgPrice: document.getElementById('avgPrice').value,
            events: document.getElementById('events').value,
            currentSales: document.getElementById('currentSales').textContent,
            improvedSales: document.getElementById('improvedSales').textContent,
            improvement: document.getElementById('improvement').textContent,
            roi: document.getElementById('roi').textContent
        };
    }

    sendEmail(email, results) {
        // 実際の実装では、バックエンドAPIまたはメール送信サービスを使用
        console.log('メール送信:', email, results);
        
        // ここではシミュレーション
        const btn = document.querySelector('.email-btn');
        const originalText = btn.textContent;
        
        btn.textContent = '送信中...';
        btn.disabled = true;
        
        setTimeout(() => {
            btn.textContent = '送信完了！';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 2000);
            
            // 成功メッセージ
            this.showSuccessMessage('詳細レポートをメールで送信しました！');
        }, 1500);
    }

    showSuccessMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            font-weight: 600;
            animation: slideInRight 0.3s ease-out;
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 300);
        }, 3000);
    }
}

// アニメーション用CSS追加
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    new ROICalculator();
});

// サンプルデータ投入機能（開発用）
function loadSampleData() {
    document.getElementById('visitors').value = '5000';
    document.getElementById('avgPrice').value = '3000';
    document.getElementById('events').value = '12';
    
    // 自動計算を実行
    const calculator = new ROICalculator();
    calculator.calculateROI();
}

// デバッグ用：コンソールでloadSampleData()を実行してテスト可能