// Events Data - Easy to manage by just adding new objects here
const events = [
    {
        dj: "DJ Template",
        theme: "Deep House Nights",
        date: "2025-09-20T21:00:00Z",
        description: "description!",
        image: "https://img.rec.net/3j5p75hpxlqlp1x0vb4i61mvx.jpg?width=1920"
    }
];

// Global variables
let currentDate = new Date();
let selectedEvent = null;
let userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// DOM elements
const eventsContainer = document.getElementById('events-container');
const calendarGrid = document.getElementById('calendar-grid');
const currentMonthElement = document.getElementById('current-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const eventModal = document.getElementById('event-modal');
const closeModal = document.querySelector('.close');
const dayModal = document.getElementById('day-modal');
const dayModalClose = document.querySelector('.day-modal-close');
const dayModalTitle = document.getElementById('day-modal-title');
const dayModalDate = document.getElementById('day-modal-date');
const dayEventsList = document.getElementById('day-events-list');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderEvents();
    renderCalendar();
    setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    closeModal.addEventListener('click', () => {
        eventModal.style.display = 'none';
    });

    dayModalClose.addEventListener('click', () => {
        dayModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === eventModal) {
            eventModal.style.display = 'none';
        }
        if (e.target === dayModal) {
            dayModal.style.display = 'none';
        }
    });
}

// Render events in sidebar
function renderEvents() {
    eventsContainer.innerHTML = '';
    
    // Group events by date
    const eventsByDate = {};
    events.forEach((event, index) => {
        const eventDate = new Date(event.date);
        const dateKey = eventDate.toDateString();
        
        if (!eventsByDate[dateKey]) {
            eventsByDate[dateKey] = [];
        }
        eventsByDate[dateKey].push({ ...event, originalIndex: index });
    });
    
    // Sort dates
    const sortedDates = Object.keys(eventsByDate).sort((a, b) => new Date(a) - new Date(b));
    
    sortedDates.forEach(dateKey => {
        const dayEvents = eventsByDate[dateKey];
        const eventDate = new Date(dateKey);
        
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        const timezoneTime = eventDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: userTimezone
        });
        
        eventElement.innerHTML = `
            <div class="event-dj">${dayEvents[0].dj}${dayEvents.length > 1 ? ` +${dayEvents.length - 1} more` : ''}</div>
            <div class="event-theme">${dayEvents[0].theme}</div>
            <div class="event-date">${formattedDate} at ${timezoneTime} (${userTimezone})</div>
            ${dayEvents.length > 1 ? `<div class="event-count">${dayEvents.length} events</div>` : ''}
        `;
        
        eventElement.addEventListener('click', () => {
            openDayModal(eventDate, dayEvents);
        });
        
        eventsContainer.appendChild(eventElement);
    });
}

// Open day schedule modal
function openDayModal(date, dayEvents) {
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    dayModalTitle.textContent = `Events for ${formattedDate}`;
    dayModalDate.textContent = `Your timezone: ${userTimezone}`;
    
    dayEventsList.innerHTML = '';
    
    // Sort events by time
    const sortedEvents = dayEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedEvents.forEach((event, index) => {
        const eventElement = document.createElement('div');
        eventElement.className = 'day-event-item';
        
        const eventDate = new Date(event.date);
        const timezoneTime = eventDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: userTimezone
        });
        
        eventElement.innerHTML = `
            <div class="day-event-dj">${event.dj}</div>
            <div class="day-event-theme">${event.theme}</div>
            <div class="day-event-time">${timezoneTime} (${userTimezone})</div>
            <div class="day-event-description">${event.description}</div>
        `;
        
        eventElement.addEventListener('click', () => {
            openEventModal(event);
        });
        
        dayEventsList.appendChild(eventElement);
    });
    
    dayModal.style.display = 'block';
}

// Select event and highlight in calendar
function selectEvent(eventIndex) {
    // Remove previous selection
    document.querySelectorAll('.event-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selection to clicked event
    document.querySelector(`[data-event-index="${eventIndex}"]`).classList.add('selected');
    
    selectedEvent = events[eventIndex];
    
    // Re-render calendar to highlight the selected event
    renderCalendar();
}

// Render calendar
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month display
    currentMonthElement.textContent = currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
    
    // Clear calendar grid
    calendarGrid.innerHTML = '';
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Get today's date for highlighting
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Check if this is today
        if (isCurrentMonth && day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Check if this day has events
        const dayDate = new Date(year, month, day);
        const dayEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === day && 
                   eventDate.getMonth() === month && 
                   eventDate.getFullYear() === year;
        });
        
        if (dayEvents.length > 0) {
            dayElement.classList.add('has-event');
            
            // Add class for multiple events
            if (dayEvents.length > 1) {
                dayElement.classList.add('multiple-events');
            }
        }
        
        // Add click event to open day modal if there are events
        if (dayEvents.length > 0) {
            dayElement.addEventListener('click', () => {
                openDayModal(dayDate, dayEvents);
            });
        }
        
        calendarGrid.appendChild(dayElement);
    }
    
    // Add empty cells for days after the last day of the month
    const totalCells = startingDayOfWeek + daysInMonth;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days = 42 cells
    
    for (let i = 0; i < remainingCells; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendarGrid.appendChild(emptyDay);
    }
}

// Open event modal
function openEventModal(event) {
    // Close the day modal if open
    dayModal.style.display = 'none';

    const modal = document.getElementById('event-modal');
    const modalImage = document.querySelector('.modal-image');
    const modalDj = document.getElementById('modal-dj');
    const modalTheme = document.getElementById('modal-theme');
    const modalDate = document.getElementById('modal-date');
    const modalDescription = document.getElementById('modal-description');
    
    // Set event data
    modalImage.style.backgroundImage = `url(${event.image})`;
    modalDj.textContent = event.dj;
    modalTheme.textContent = event.theme;
    
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = eventDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: userTimezone
    });
    
    modalDate.textContent = `${formattedDate} at ${formattedTime} (${userTimezone})`;
    modalDescription.textContent = event.description;
    
    // Show modal
    modal.style.display = 'block';
    
    // Add entrance animation
    setTimeout(() => {
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
        modal.querySelector('.modal-content').style.opacity = '1';
    }, 10);
}

// Add CSS for selected event
const style = document.createElement('style');
style.textContent = `
    .event-item.selected {
        border-color: rgba(99, 102, 241, 0.6) !important;
        box-shadow: 
            0 4px 16px rgba(99, 102, 241, 0.2),
            inset 0 0 0 1px rgba(99, 102, 241, 0.3) !important;
        background: rgba(99, 102, 241, 0.08) !important;
    }
    
    .modal-content {
        transform: scale(0.9);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .modal.show .modal-content {
        transform: scale(1);
        opacity: 1;
    }
`;
document.head.appendChild(style);