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
    });

    // Close menu when clicking nav links
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Sticky Header Shadow on Scroll ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var handleHeaderScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 20);
    };
    window.addEventListener("scroll", handleHeaderScroll, { passive: true });
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
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
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
                target.textContent = currentValue + "–12";
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
                  target.textContent = "1–12";
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

  /* ---------- Gallery Categorized Filtering ---------- */
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

        // Filter items
        var category = btn.getAttribute("data-filter");
        galleryItems.forEach(function (item) {
          if (category === "all" || item.getAttribute("data-category") === category) {
            item.style.display = "";
            // Trigger a quick layout redraw or fade-in transition
            setTimeout(function () {
              item.style.opacity = "1";
              item.style.transform = "scale(1)";
            }, 50);
          } else {
            item.style.opacity = "0";
            item.style.transform = "scale(0.95)";
            setTimeout(function () {
              item.style.display = "none";
            }, 300); // match CSS transitions
          }
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

  /* ---------- Form Handling (Demonstration Notification) ---------- */
  var enquiryForm = document.querySelector("#enquiry-form");
  if (enquiryForm) {
    enquiryForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = document.querySelector("#form-note");
      if (note) {
        note.textContent = "Thank you! Your enquiry has been received successfully. Our team will get back to you within 24 hours.";
        note.style.color = "#059669";
        note.style.fontWeight = "600";
      }
      enquiryForm.reset();
    });
  }

  /* ---------- Current Year Footer Update ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
