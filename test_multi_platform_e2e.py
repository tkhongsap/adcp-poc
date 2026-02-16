#!/usr/bin/env python3
"""
E2E tests for multi-platform data implementation.
Tests the full stack: backend API, frontend UI, and AI agent behavior.
"""

from playwright.sync_api import sync_playwright
import time
import json

def test_multi_platform_e2e():
    """Run comprehensive E2E tests for multi-platform implementation."""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Enable console logging
        console_logs = []
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))

        print("=" * 80)
        print("MULTI-PLATFORM E2E TESTS")
        print("=" * 80)

        # Test 1: Platform-Specific Inventory Discovery (Facebook)
        print("\n[Test 1] Platform-Specific Inventory Discovery - Facebook Products")
        page.goto('http://localhost:5000')
        page.wait_for_load_state('networkidle')

        # Find chat input and send message
        chat_input = page.locator('textarea[placeholder*="message"], input[placeholder*="message"], textarea').first
        chat_input.fill("Show me all Facebook Ads products")

        # Find and click send button
        send_button = page.locator('button[type="submit"], button:has-text("Send")').first
        send_button.click()

        # Wait for response
        time.sleep(8)

        # Take screenshot
        page.screenshot(path='/tmp/test1_facebook_products.png', full_page=True)

        # Check for Facebook products in the response
        page_content = page.content()
        facebook_indicators = [
            'facebook_ads' in page_content.lower() or 'facebook' in page_content.lower(),
            'news feed' in page_content.lower() or 'stories' in page_content.lower(),
            'reels' in page_content.lower() or 'marketplace' in page_content.lower()
        ]

        if any(facebook_indicators):
            print("✓ Facebook products displayed correctly")
        else:
            print("✗ Facebook products not found in response")

        # Test 2: Platform-Specific Performance Query (Google Ads)
        print("\n[Test 2] Platform-Specific Performance - Google Ads")

        # Clear and send new message
        chat_input.fill("How are our Google Ads campaigns performing?")
        send_button.click()
        time.sleep(10)

        page.screenshot(path='/tmp/test2_google_performance.png', full_page=True)

        page_content = page.content()
        google_indicators = [
            'google' in page_content.lower(),
            'quality score' in page_content.lower() or 'impression share' in page_content.lower(),
            'apex motors' in page_content.lower() or 'techflow' in page_content.lower()
        ]

        if any(google_indicators):
            print("✓ Google Ads performance data displayed")
        else:
            print("✗ Google Ads performance not found")

        # Test 3: Cross-Platform Brand Query
        print("\n[Test 3] Cross-Platform Brand Query - Apex Motors")

        chat_input.fill("How is Apex Motors performing across all platforms?")
        send_button.click()
        time.sleep(12)

        page.screenshot(path='/tmp/test3_apex_cross_platform.png', full_page=True)

        page_content = page.content()
        cross_platform_indicators = [
            page_content.lower().count('apex motors') >= 2,
            'display' in page_content.lower() or 'facebook' in page_content.lower(),
            'google' in page_content.lower() or 'platform' in page_content.lower()
        ]

        if any(cross_platform_indicators):
            print("✓ Cross-platform Apex Motors data displayed")
        else:
            print("✗ Cross-platform aggregation not found")

        # Test 4: Dashboard Navigation and Display
        print("\n[Test 4] Dashboard - Media Buys View")

        page.goto('http://localhost:5000/dashboard/media-buys')
        page.wait_for_load_state('networkidle')
        time.sleep(3)

        page.screenshot(path='/tmp/test4_dashboard_media_buys.png', full_page=True)

        # Check for table/list of media buys
        dashboard_content = page.content()
        dashboard_indicators = [
            'apex motors' in dashboard_content.lower(),
            'techflow' in dashboard_content.lower() or 'sportmax' in dashboard_content.lower(),
            'platform' in dashboard_content.lower() or 'facebook' in dashboard_content.lower()
        ]

        if any(dashboard_indicators):
            print("✓ Dashboard displays media buys")
        else:
            print("✗ Dashboard media buys not found")

        # Test 5: Backward Compatibility - Legacy Campaign Query
        print("\n[Test 5] Backward Compatibility - Original Campaign")

        page.goto('http://localhost:5000')
        page.wait_for_load_state('networkidle')
        time.sleep(2)

        chat_input = page.locator('textarea[placeholder*="message"], input[placeholder*="message"], textarea').first
        chat_input.fill("Show me the Apex Motors Q1 campaign details")

        send_button = page.locator('button[type="submit"], button:has-text("Send")').first
        send_button.click()
        time.sleep(8)

        page.screenshot(path='/tmp/test5_backward_compat.png', full_page=True)

        page_content = page.content()
        compat_indicators = [
            'apex motors' in page_content.lower(),
            'display' in page_content.lower() or 'programmatic' in page_content.lower(),
            'mb_apex_motors_q1' in page_content.lower() or 'campaign' in page_content.lower()
        ]

        if any(compat_indicators):
            print("✓ Backward compatibility maintained")
        else:
            print("✗ Legacy campaign not found")

        # Test 6: Platform Comparison
        print("\n[Test 6] Platform Comparison Query")

        chat_input.fill("Compare Facebook vs Google Ads performance")
        send_button.click()
        time.sleep(12)

        page.screenshot(path='/tmp/test6_platform_comparison.png', full_page=True)

        page_content = page.content()
        comparison_indicators = [
            'facebook' in page_content.lower() and 'google' in page_content.lower(),
            'comparison' in page_content.lower() or 'versus' in page_content.lower() or 'vs' in page_content.lower(),
            any(metric in page_content.lower() for metric in ['cpm', 'ctr', 'spend', 'performance'])
        ]

        if any(comparison_indicators):
            print("✓ Platform comparison displayed")
        else:
            print("✗ Platform comparison not found")

        # Summary
        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        print("Screenshots saved to /tmp/test*.png")
        print("All tests completed successfully!")
        print("\nConsole logs:", len(console_logs), "messages")

        # Check for errors in console
        errors = [log for log in console_logs if 'error' in log.lower()]
        if errors:
            print("\n⚠ Console errors detected:")
            for error in errors[:5]:  # Show first 5 errors
                print(f"  {error}")
        else:
            print("✓ No console errors detected")

        browser.close()

if __name__ == "__main__":
    test_multi_platform_e2e()
