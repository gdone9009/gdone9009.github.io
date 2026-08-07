#!/usr/bin/env python3
"""
Automated Mission Verification Test Suite for Vanilla JS Portfolio
"""

import sys
import os
import re
from pathlib import Path

PORTFOLIO_DIR = Path(__file__).parent.parent.resolve()

def test_file_structure():
    required_files = [
        PORTFOLIO_DIR / "index.html",
        PORTFOLIO_DIR / "css" / "style.css",
        PORTFOLIO_DIR / "js" / "main.js"
    ]
    for file_path in required_files:
        assert file_path.exists(), f"Missing required file: {file_path}"
    print("✅ [PASS] Project File Structure Check")

def test_html_semantics():
    html_content = (PORTFOLIO_DIR / "index.html").read_text(encoding="utf-8")
    
    # Check Semantic Tags
    semantic_tags = ["<header", "<nav", "<main", "<section", "<footer"]
    for tag in semantic_tags:
        assert tag in html_content, f"Missing semantic HTML tag: {tag}"
        
    # Check Required Sections
    sections = ['id="hero"', 'id="about"', 'id="skills"', 'id="projects"', 'id="contact"']
    for sec in sections:
        assert sec in html_content, f"Missing required section: {sec}"
        
    # Check Label matching
    assert 'for="name"' in html_content and 'id="name"' in html_content, "Label for-id matching missing for name"
    assert 'for="email"' in html_content and 'id="email"' in html_content, "Label for-id matching missing for email"
    assert 'for="message"' in html_content and 'id="message"' in html_content, "Label for-id matching missing for message"
    
    # Check Script defer
    assert 'src="js/main.js"' in html_content and 'defer' in html_content, "Script tag must have defer attribute"
    print("✅ [PASS] HTML5 Semantic Structure & Accessibility Check")

def test_css_variables_and_grid():
    css_content = (PORTFOLIO_DIR / "css" / "style.css").read_text(encoding="utf-8")
    
    # Check CSS Variables
    assert ":root" in css_content, "Missing :root CSS variable declaration"
    assert '[data-theme="dark"]' in css_content, "Missing dark mode CSS variables"
    
    # Check Grid and Flexbox
    assert "display: flex" in css_content or "display:flex" in css_content, "Missing Flexbox"
    assert "grid-template-columns" in css_content, "Missing CSS Grid layout"
    assert "auto-fit" in css_content and "minmax" in css_content, "Projects Grid must use auto-fit and minmax"
    
    print("✅ [PASS] CSS3 Tokens, Flexbox & Grid Responsive Architecture Check")

def test_js_state_and_handlers():
    js_content = (PORTFOLIO_DIR / "js" / "main.js").read_text(encoding="utf-8")
    
    # No var usage
    assert not re.search(r'\bvar\s+', js_content), "JavaScript codebase must not use 'var' keyword"
    
    # State handlers check
    assert "const state =" in js_content or "let state =" in js_content, "Missing State object"
    assert "localStorage" in js_content, "Missing localStorage persistence for theme"
    assert "fetch(" in js_content, "Missing fetch for GitHub API"
    assert "async" in js_content and "await" in js_content, "Missing async/await syntax"
    
    # UI state handlers
    assert "loading" in js_content, "Missing loading state handler"
    assert "success" in js_content, "Missing success state handler"
    assert "error" in js_content, "Missing error state handler"
    assert "empty" in js_content or "filteredProjects" in js_content, "Missing empty state handler"
    
    print("✅ [PASS] JavaScript ES6+ State-Driven Engine Check")

def main():
    print("====== VANILLA JS PORTFOLIO TEST SUITE ======")
    test_file_structure()
    test_html_semantics()
    test_css_variables_and_grid()
    test_js_state_and_handlers()
    print("=============================================")
    print("🎉 ALL TESTS PASSED SUCCESSFULLY! (4/4 PASS)")

if __name__ == "__main__":
    main()
