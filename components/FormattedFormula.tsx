
import React from 'react';

interface FormattedFormulaProps {
    latex: string;
    className?: string;
}

/**
 * Renders a LaTeX string as a high-quality PNG image using the CodeCogs API.
 * This avoids client-side JavaScript rendering issues and ensures consistency.
 * The formula is rendered in white at 150 DPI to be legible on dark backgrounds.
 * Adds crossOrigin="anonymous" to allow html2canvas to capture the image for PDF export.
 * @param {string} latex The LaTeX string to render.
 * @param {string} [className] Optional CSS classes for the image element.
 */
const FormattedFormula: React.FC<FormattedFormulaProps> = ({ latex, className = '' }) => {
    // We add LaTeX commands to make the formula high-resolution and white.
    // The order \dpi then \color is sometimes more compatible.
    const rawLatex = `\\dpi{150} \\color{white} ${latex}`;
    
    // URL-encode the LaTeX string to be safely used in a URL.
    const encodedLatex = encodeURIComponent(rawLatex);
    const src = `https://latex.codecogs.com/png.image?${encodedLatex}`;

    return (
        <img
            src={src}
            alt={`Fórmula: ${latex}`}
            crossOrigin="anonymous" // Crucial for html2canvas to capture the image
            className={`inline-block align-middle ${className}`}
            style={{ maxWidth: '100%', verticalAlign: 'middle' }}
        />
    );
};

export default FormattedFormula;
