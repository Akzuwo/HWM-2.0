import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import hoverCapabilities from './postcss-hover.cjs';

export default { plugins: [tailwindcss(), autoprefixer(), hoverCapabilities()] };
