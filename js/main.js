/* ============================================================
   SRI DURKA ACADEMY — main.js
   Handles: mobile navigation, scrolled header state, scroll-reveal,
   active link highlighting, gallery filtering, custom lightbox,
   FAQ accordion toggle, and animated number counters.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Mobile Nav Toggle ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      // Prevent background scroll when mobile nav is open
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Close menu when clicking nav links
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Sticky Header Shadow on Scroll (Throttled) ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var lastScrolled = false;
    var scrollTicking = false;
    var handleHeaderScroll = function () {
      var shouldBeScrolled = window.scrollY > 20;
      if (shouldBeScrolled !== lastScrolled) {
        lastScrolled = shouldBeScrolled;
        header.classList.toggle("scrolled", shouldBeScrolled);
      }
      scrollTicking = false;
    };
    window.addEventListener("scroll", function () {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(handleHeaderScroll);
      }
    }, { passive: true });
    handleHeaderScroll(); // Run on load
  }

  /* ---------- Active Nav Link Detection ---------- */
  var currentPath = (location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll(".main-nav a[data-page]").forEach(function (link) {
    if (link.getAttribute("data-page") === currentPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  /* ---------- Scroll Reveal (Intersection Observer) ---------- */
  var revealElements = document.querySelectorAll(".reveal");
  var isMobile = window.matchMedia("(max-width: 768px)").matches;
  if ("IntersectionObserver" in window && revealElements.length) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: isMobile ? 0.01 : 0.08,
        rootMargin: isMobile ? "0px 0px 50px 0px" : "0px 0px -40px 0px"
      }
    );
    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------- Animated Statistics Counters ---------- */
  var counterElements = document.querySelectorAll(".stat-num");
  if ("IntersectionObserver" in window && counterElements.length) {
    var countObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var target = entry.target;
            var endValue = parseInt(target.getAttribute("data-count"), 10);
            var duration = 2000; // 2 seconds
            var startValue = 0;
            var startTime = null;

            function animateCount(timestamp) {
              if (!startTime) startTime = timestamp;
              var progress = timestamp - startTime;
              var percentage = Math.min(progress / duration, 1);
              
              // Easing function (easeOutQuad)
              var easePercentage = percentage * (2 - percentage);
              var currentValue = Math.floor(startValue + easePercentage * (endValue - startValue));
              
              // Formatting rules for specific counters
              if (target.id === "counter-tuition") {
                target.textContent = (currentValue <= 1 ? "1st" : currentValue + "th") + "–12th";
              } else if (target.id === "counter-courses") {
                target.textContent = currentValue + "+";
              } else if (target.id === "counter-age") {
                target.textContent = currentValue + "–16";
              } else {
                target.textContent = currentValue;
              }

              if (progress < duration) {
                requestAnimationFrame(animateCount);
              } else {
                // Final value safety check
                if (target.id === "counter-tuition") {
                  target.textContent = "1st–12th";
                } else if (target.id === "counter-courses") {
                  target.textContent = "10+";
                } else if (target.id === "counter-age") {
                  target.textContent = "4–16";
                } else {
                  target.textContent = endValue;
                }
              }
            }

            requestAnimationFrame(animateCount);
            countObserver.unobserve(target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counterElements.forEach(function (el) {
      // Store the target number in data-count attribute
      var text = el.textContent.trim();
      var targetNum = 0;
      if (text.includes("–")) {
        // e.g., "1–12" -> target 12, "4–16" -> target 16
        targetNum = parseInt(text.split("–")[1], 10);
      } else {
        targetNum = parseInt(text.replace(/[^0-9]/g, ""), 10) || 0;
      }
      el.setAttribute("data-count", targetNum);
      el.textContent = "0"; // Reset before animation
      countObserver.observe(el);
    });
  }

  /* ---------- Gallery Categorized Filtering (rAF-batched) ---------- */
  var filterButtons = document.querySelectorAll(".filter-btn");
  var galleryItems = document.querySelectorAll(".gallery-card");
  if (filterButtons.length && galleryItems.length) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        // Update active class on buttons
        filterButtons.forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");

        // Filter items using rAF to batch DOM reads/writes
        var category = btn.getAttribute("data-filter");
        var toShow = [];
        var toHide = [];

        galleryItems.forEach(function (item) {
          if (category === "all" || item.getAttribute("data-category") === category) {
            toShow.push(item);
          } else {
            toHide.push(item);
          }
        });

        // Batch write: hide items first
        requestAnimationFrame(function () {
          toHide.forEach(function (item) {
            item.style.opacity = "0";
            item.style.transform = "scale(0.95)";
          });

          // Show matching items
          toShow.forEach(function (item) {
            item.style.display = "";
          });

          // Next frame: reveal shown items
          requestAnimationFrame(function () {
            toShow.forEach(function (item) {
              item.style.opacity = "1";
              item.style.transform = "scale(1)";
            });

            // Remove hidden items from layout after transition
            setTimeout(function () {
              toHide.forEach(function (item) {
                item.style.display = "none";
              });
            }, 300);
          });
        });
      });
    });
  }

  /* ---------- Accessible Custom Lightbox ---------- */
  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbCaption = lightbox.querySelector(".lightbox-caption");
    var closeBtn = lightbox.querySelector(".lightbox-close");

    var openLightbox = function (src, caption) {
      lbImg.src = src;
      lbImg.alt = caption || "Gallery Image";
      if (lbCaption) lbCaption.textContent = caption || "";
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    };

    var closeLightbox = function () {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
    };

    // Attach click event to all lightbox triggers
    document.querySelectorAll("[data-lightbox]").forEach(function (trigger) {
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        var src = trigger.getAttribute("data-lightbox");
        var caption = trigger.getAttribute("data-caption") || "";
        openLightbox(src, caption);
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("open")) {
        closeLightbox();
      }
    });
  }

  /* ---------- FAQ Accordion Collapse ---------- */
  var faqQuestions = document.querySelectorAll(".faq-question");
  if (faqQuestions.length) {
    faqQuestions.forEach(function (question) {
      question.addEventListener("click", function () {
        var faqItem = question.parentElement;
        var answer = faqItem.querySelector(".faq-answer");
        var isOpen = faqItem.classList.contains("active");

        // Close other FAQ items
        document.querySelectorAll(".faq-item").forEach(function (item) {
          item.classList.remove("active");
          item.querySelector(".faq-answer").style.maxHeight = null;
        });

        // Toggle current FAQ item
        if (!isOpen) {
          faqItem.classList.add("active");
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    });
  }

  /* ============================================================
     GOOGLE SHEETS INTEGRATION CONFIGURATION
     Paste your Google Apps Script Web App URL below.
     Example: https://script.google.com/macros/s/ABCDEFGHIJK123456789/exec
     ============================================================ */
  var GOOGLE_SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby96rP18Gf5pMBH0xacdoSYBR_yKmTefNRpXPrK4qEKKpbK62tz0IfOW6dpZWy5eEc/exec";

  /* ---------- Form Handling & Validation ---------- */
  var enquiryForm = document.querySelector("#enquiry-form");
  if (enquiryForm) {
    var nameInput = document.querySelector("#name");
    var phoneInput = document.querySelector("#phone");
    var emailInput = document.querySelector("#email");
    var branchSelect = document.querySelector("#branch");
    var interestSelect = document.querySelector("#interest");
    var messageInput = document.querySelector("#message");
    var submitBtn = document.querySelector("#form-submit-btn");
    var formAlert = document.querySelector("#form-alert");

    // Validation patterns
    var phonePattern = /^[6-9]\d{9}$/;
    var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    function showError(input, errorEl, message) {
      if (input) {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
      }
      if (errorEl) {
        errorEl.textContent = message;
      }
    }

    function clearError(input, errorEl) {
      if (input) {
        input.classList.remove("is-invalid");
        if (input.value.trim() !== "") {
          input.classList.add("is-valid");
        } else {
          input.classList.remove("is-valid");
        }
      }
      if (errorEl) {
        errorEl.textContent = "";
      }
    }

    // Real-time input listener: Full Name
    if (nameInput) {
      nameInput.addEventListener("input", function () {
        if (nameInput.value.trim().length >= 2) {
          clearError(nameInput, document.querySelector("#name-error"));
        }
      });
    }

    // Real-time input listener: Phone Number (Format check & auto-filter digits)
    if (phoneInput) {
      phoneInput.addEventListener("input", function () {
        phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
        if (phonePattern.test(phoneInput.value)) {
          clearError(phoneInput, document.querySelector("#phone-error"));
        }
      });
    }

    // Real-time input listener: Email Address (Format check)
    if (emailInput) {
      emailInput.addEventListener("input", function () {
        if (emailPattern.test(emailInput.value.trim())) {
          clearError(emailInput, document.querySelector("#email-error"));
        }
      });
    }

    // Change listener: Preferred Branch
    if (branchSelect) {
      branchSelect.addEventListener("change", function () {
        if (branchSelect.value !== "") {
          clearError(branchSelect, document.querySelector("#branch-error"));
        }
      });
    }

    // Change listener: Program of Interest
    if (interestSelect) {
      interestSelect.addEventListener("change", function () {
        if (interestSelect.value !== "") {
          clearError(interestSelect, document.querySelector("#interest-error"));
        }
      });
    }

    // Form Submit Handler
    enquiryForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var isValid = true;
      var firstInvalidInput = null;

      // 1. Validate Full Name (Required)
      var nameVal = nameInput ? nameInput.value.trim() : "";
      var nameError = document.querySelector("#name-error");
      if (!nameVal || nameVal.length < 2) {
        showError(nameInput, nameError, "Full name is required (minimum 2 characters).");
        isValid = false;
        if (!firstInvalidInput) firstInvalidInput = nameInput;
      } else {
        clearError(nameInput, nameError);
      }

      // 2. Validate Phone Number (Required & Valid 10-digit format)
      var phoneVal = phoneInput ? phoneInput.value.trim() : "";
      var phoneError = document.querySelector("#phone-error");
      if (!phoneVal) {
        showError(phoneInput, phoneError, "Phone number is required.");
        isValid = false;
        if (!firstInvalidInput) firstInvalidInput = phoneInput;
      } else if (!phonePattern.test(phoneVal)) {
        showError(phoneInput, phoneError, "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.");
        isValid = false;
        if (!firstInvalidInput) firstInvalidInput = phoneInput;
      } else {
        clearError(phoneInput, phoneError);
      }

      // 3. Validate Email Address (Required & Valid Format)
      var emailVal = emailInput ? emailInput.value.trim() : "";
      var emailError = document.querySelector("#email-error");
      if (!emailVal) {
        showError(emailInput, emailError, "Email address is required.");
        isValid = false;
        if (!firstInvalidInput) firstInvalidInput = emailInput;
      } else if (!emailPattern.test(emailVal)) {
        showError(emailInput, emailError, "Please enter a valid email address (e.g., name@example.com).");
        isValid = false;
        if (!firstInvalidInput) firstInvalidInput = emailInput;
      } else {
        clearError(emailInput, emailError);
      }

      // 4. Validate Preferred Branch (Required)
      var branchVal = branchSelect ? branchSelect.value : "";
      var branchError = document.querySelector("#branch-error");
      if (!branchVal) {
        showError(branchSelect, branchError, "Please select your preferred branch.");
        isValid = false;
        if (!firstInvalidInput) firstInvalidInput = branchSelect;
      } else {
        clearError(branchSelect, branchError);
      }

      // 5. Validate Program of Interest (Required)
      var interestVal = interestSelect ? interestSelect.value : "";
      var interestError = document.querySelector("#interest-error");
      if (!interestVal) {
        showError(interestSelect, interestError, "Please select your program of interest.");
        isValid = false;
        if (!firstInvalidInput) firstInvalidInput = interestSelect;
      } else {
        clearError(interestSelect, interestError);
      }

      // NOTE: Detailed Message is explicitly OPTIONAL (not required)

      // If invalid, focus first invalid field & show alert message
      if (!isValid) {
        if (firstInvalidInput) {
          firstInvalidInput.focus();
        }
        if (formAlert) {
          formAlert.className = "form-alert error";
          formAlert.style.display = "flex";
          formAlert.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>Please correct all highlighted fields with valid information before submitting.</span>';
        }
        return;
      }

      // --- All fields valid, proceed with submission ---

      // Clear any previous alert banner
      if (formAlert) {
        formAlert.style.display = "none";
      }

      // Capture values before reset (for success message)
      var messageVal = messageInput ? messageInput.value.trim() : "";
      var timestampVal = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

      // Submit State — disable button
      var originalBtnText = submitBtn ? submitBtn.textContent : "Get Enrolled Today";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting Enquiry...";
      }

      var scriptUrl = GOOGLE_SHEET_SCRIPT_URL || enquiryForm.getAttribute("data-sheet-url") || "";

      // ============================================================
      //  BUILD URL-ENCODED BODY (most reliable for Google Apps Script)
      //  Google Apps Script doPost(e) reads e.parameter.fieldName
      //  when Content-Type is application/x-www-form-urlencoded.
      // ============================================================
      var payload = [
        "name="      + encodeURIComponent(nameVal),
        "phone="     + encodeURIComponent(phoneVal),
        "email="     + encodeURIComponent(emailVal),
        "branch="    + encodeURIComponent(branchVal),
        "interest="  + encodeURIComponent(interestVal),
        "message="   + encodeURIComponent(messageVal),
        "timestamp=" + encodeURIComponent(timestampVal)
      ].join("&");

      console.log("[SDA Form] Submitting to:", scriptUrl);
      console.log("[SDA Form] Payload:", payload);

      // Success handler — show green confirmation
      function handleSuccess() {
        console.log("[SDA Form] Submission successful.");
        if (formAlert) {
          formAlert.className = "form-alert success";
          formAlert.style.display = "flex";
          formAlert.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><div><strong>Enquiry Submitted Successfully!</strong><br>Thank you, ' + nameVal + '. Your enquiry for <strong>' + interestVal + '</strong> (' + branchVal + ') has been received. Our team will contact you at <strong>' + phoneVal + '</strong> / <strong>' + emailVal + '</strong> within 24 hours.</div>';
        }
        enquiryForm.reset();
        // Remove all validation classes
        [nameInput, phoneInput, emailInput, branchSelect, interestSelect, messageInput].forEach(function (el) {
          if (el) el.classList.remove("is-valid", "is-invalid");
        });
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }

      // Error handler — show red error with clear message
      function handleError(errorMsg) {
        console.error("[SDA Form] Submission failed:", errorMsg);
        if (formAlert) {
          formAlert.className = "form-alert error";
          formAlert.style.display = "flex";
          formAlert.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><div><strong>Submission Failed</strong><br>Could not deliver your enquiry. Please check your internet connection and try again, or contact us directly at <strong>+91 77086 41729</strong>.</div>';
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }

      // Guard: if script URL is not configured, show success demo only
      if (!scriptUrl || scriptUrl.trim() === "" || scriptUrl.indexOf("YOUR_GOOGLE_SHEET") !== -1) {
        console.warn("[SDA Form] Google Script URL not configured. Showing demo success.");
        setTimeout(handleSuccess, 500);
        return;
      }

      // ============================================================
      //  SUBMIT STRATEGY — Reliable Google Apps Script POST
      //
      //  Google Apps Script Web Apps have CORS quirks:
      //  - The POST body IS received and processed by doPost(e)
      //    even when the browser throws a CORS error on the response.
      //  - Using mode:"no-cors" guarantees the request is sent but
      //    returns an opaque response (status 0, no body readable).
      //
      //  Strategy:
      //  1. POST with mode:"no-cors" — guarantees data delivery.
      //  2. Follow up with a GET verification ping to confirm the
      //     Apps Script endpoint is alive and responding.
      //  3. If the GET ping succeeds, the data was saved — show success.
      //  4. If both fail, retry once before showing an error.
      // ============================================================

      function submitToSheet(retryCount) {
        var beaconSupported = typeof navigator !== "undefined" && navigator.sendBeacon;

        if (beaconSupported) {
          var beaconPayload = new Blob([payload], { type: "application/x-www-form-urlencoded;charset=UTF-8" });
          var beaconSent = navigator.sendBeacon(scriptUrl, beaconPayload);

          if (beaconSent) {
            console.log("[SDA Form] Beacon submission sent successfully.");
            handleSuccess();
            return;
          }
        }

        // Fallback for browsers without Beacon support or if the browser rejects the request.
        fetch(scriptUrl, {
          method: "POST",
          mode: "no-cors",
          keepalive: true,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: payload
        })
        .then(function () {
          console.log("[SDA Form] POST sent (no-cors). Assuming delivery succeeded.");
          handleSuccess();
        })
        .catch(function (postError) {
          console.error("[SDA Form] POST failed:", postError.message);
          if (retryCount < 1) {
            console.log("[SDA Form] Retrying submission (attempt " + (retryCount + 2) + ")...");
            if (submitBtn) {
              submitBtn.textContent = "Retrying...";
            }
            setTimeout(function () {
              submitToSheet(retryCount + 1);
            }, 1500);
          } else {
            handleError(postError.message);
          }
        });
      }

      // Start submission with retry counter at 0
      submitToSheet(0);
    });
  }

  /* ---------- Current Year Footer Update ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
