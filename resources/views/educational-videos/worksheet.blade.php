<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $video->title ?? $video->storyboard['title'] ?? 'Worksheet' }} — Worksheet</title>
    <style>
        :root {
            color-scheme: light;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1e1b2e;
            max-width: 720px;
            margin: 0 auto;
            padding: 48px 32px;
            line-height: 1.5;
        }

        h1 {
            font-size: 24px;
            margin-bottom: 4px;
        }

        .subtitle {
            color: #6b7280;
            margin-top: 0;
            margin-bottom: 32px;
        }

        .name-line {
            display: flex;
            gap: 32px;
            margin-bottom: 32px;
        }

        .name-line span {
            flex: 1;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 4px;
            color: #6b7280;
            font-size: 14px;
        }

        .question {
            margin-bottom: 28px;
        }

        .question p {
            font-weight: 600;
            margin: 0 0 10px;
        }

        .options {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .options li {
            display: flex;
            align-items: baseline;
            gap: 10px;
            margin-bottom: 8px;
        }

        .option-marker {
            display: inline-block;
            width: 22px;
            height: 22px;
            border: 1px solid #9ca3af;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .answer-key {
            margin-top: 48px;
            padding-top: 24px;
            border-top: 2px dashed #d1d5db;
        }

        .answer-key h2 {
            font-size: 16px;
        }

        .answer-key ol {
            padding-left: 20px;
        }

        .print-button {
            position: fixed;
            top: 16px;
            right: 16px;
            padding: 10px 16px;
            border-radius: 8px;
            border: none;
            background: #7c3aed;
            color: white;
            font-weight: 600;
            cursor: pointer;
        }

        @media print {
            .print-button {
                display: none;
            }

            .answer-key {
                page-break-before: always;
            }

            body {
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">Print / Save as PDF</button>

    <h1>{{ $video->title ?? $video->storyboard['title'] ?? 'Worksheet' }}</h1>
    <p class="subtitle">Comprehension worksheet</p>

    <div class="name-line">
        <span>Name</span>
        <span>Date</span>
    </div>

    @foreach ($questions as $index => $question)
        <div class="question">
            <p>{{ $index + 1 }}. {{ $question['question'] }}</p>
            <ul class="options">
                @foreach ($question['options'] as $option)
                    <li>
                        <span class="option-marker"></span>
                        <span>{{ $option }}</span>
                    </li>
                @endforeach
            </ul>
        </div>
    @endforeach

    <div class="answer-key">
        <h2>Answer key</h2>
        <ol>
            @foreach ($questions as $question)
                <li>{{ $question['options'][$question['correctAnswerIndex']] ?? '—' }}</li>
            @endforeach
        </ol>
    </div>
</body>
</html>
