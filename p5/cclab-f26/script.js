const projectTitles = {
  1: 'Drawing with Code',
  2: 'Interactive Memories & Dreams',
  3: 'Generative Motion',
  4: 'Landscapes & Patterns',
  5: 'Creature Prototype',
  6: 'Living Sketches',
  7: 'Object Dancers'
};
const IDLE_RELOAD_DELAY_MS = 3 * 60 * 1000;
const USER_ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'keydown'];

document.addEventListener('DOMContentLoaded', () => {
  const listElement = document.getElementById('project-list');
  const iframe = document.getElementById('p5-iframe');
  const projectTitle = document.getElementById('project-title');
  const projectTabs = document.querySelectorAll('.project-tab:not(.disabled)');
  const availableProjectNumbers = [...projectTabs]
    .map(tab => Number(tab.dataset.project))
    .filter(projectNumber => projectTitles[projectNumber]);
  let idleReloadTimer;

  function shuffleArray(array) {
    for (let index = array.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      const temporaryEntry = array[index];
      array[index] = array[randomIndex];
      array[randomIndex] = temporaryEntry;
    }

    return array;
  }

  function toTitleCase(value) {
    return value.toLowerCase().replace(/(^|[^a-z])([a-z])/g, (match, prefix, letter) => {
      return `${prefix}${letter.toUpperCase()}`;
    });
  }

  function loadProjectSet(projectNumber) {
    fetch(`projects-${projectNumber}.csv`, { cache: 'no-store' })
      .then(response => response.text())
      .then(data => {
        const lines = data.trim().split('\n');
        const entries = [];

        listElement.replaceChildren();
        iframe.removeAttribute('src');

        lines.forEach((line, index) => {
          if (!line.trim()) {
            return;
          }

          if (index === 0 && /^name\s*,\s*project_url\s*,\s*site_url\s*$/i.test(line.trim())) {
            return;
          }

          const firstComma = line.indexOf(',');
          const secondComma = line.indexOf(',', firstComma + 1);

          if (firstComma === -1 || secondComma === -1) {
            return;
          }

          const name = line.slice(0, firstComma).trim();
          const projectUrl = line.slice(firstComma + 1, secondComma).trim();
          const documentationUrl = line.slice(secondComma + 1).trim();

          entries.push({ name, projectUrl, documentationUrl });
        });

        shuffleArray(entries).forEach((entry, index) => {
          const { name, projectUrl, documentationUrl } = entry;

          const li = document.createElement('li');

          const headerRow = document.createElement('div');
          headerRow.className = 'project-header-row';

          const nameLink = document.createElement('a');
          nameLink.className = 'project-name';
          nameLink.href = projectUrl;
          nameLink.textContent = toTitleCase(name);

          const documentationLabel = document.createElement('a');
          documentationLabel.className = 'project-documentation-label';
          documentationLabel.textContent = '+';
          documentationLabel.href = documentationUrl;
          documentationLabel.target = 'documentation';
          documentationLabel.rel = 'noopener noreferrer';

          headerRow.appendChild(nameLink);
          headerRow.appendChild(documentationLabel);
          li.appendChild(headerRow);

          const activateProject = function () {
            iframe.src = projectUrl;

            document.querySelectorAll('#project-list li').forEach(el => {
              el.classList.remove('active');
            });
            li.classList.add('active');
          };

          li.addEventListener('click', activateProject);
          nameLink.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            activateProject();
          });
          documentationLabel.addEventListener('click', event => {
            event.stopPropagation();
          });

          listElement.appendChild(li);

          if (index === 0) {
            activateProject();
          }
        });
      })
      .catch(error => console.error(error));
  }

  function selectProjectSet(projectNumber) {
    projectTitle.textContent = projectTitles[projectNumber];
    projectTabs.forEach(tab => {
      tab.classList.toggle('active', Number(tab.dataset.project) === projectNumber);
    });
    loadProjectSet(projectNumber);
  }

  function resetIdleReloadTimer() {
    clearTimeout(idleReloadTimer);
    idleReloadTimer = setTimeout(() => {
      window.location.reload();
    }, IDLE_RELOAD_DELAY_MS);
  }

  projectTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      selectProjectSet(Number(tab.dataset.project));
    });
  });

  USER_ACTIVITY_EVENTS.forEach(eventName => {
    document.addEventListener(eventName, resetIdleReloadTimer);
  });

  const initialProjectNumber = availableProjectNumbers[
    Math.floor(Math.random() * availableProjectNumbers.length)
  ];
  selectProjectSet(initialProjectNumber);
  resetIdleReloadTimer();
});