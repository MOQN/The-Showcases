document.addEventListener('DOMContentLoaded', () => {
  fetch('projects.csv')
    .then(response => response.text())
    .then(data => {
      const lines = data.trim().split('\n');
      const listElement = document.getElementById('project-list');
      const iframe = document.getElementById('p5-iframe');

      lines.forEach(line => {
        const parts = line.split(',');

        if (parts.length >= 2) {
          const name = parts[0].trim();
          const link = parts[1].trim();
          const note = parts.length > 2 ? parts[2].trim() : '';

          let instruction = '';
          if (parts.length > 3) {
            const rawInstruction = parts.slice(3).join(',');
            instruction = rawInstruction.trim().replace(/^"|"$/g, '').trim();
          }

          const li = document.createElement('li');

          const nameDiv = document.createElement('div');
          nameDiv.className = 'project-name';
          nameDiv.textContent = name;

          const noteDiv = document.createElement('div');
          noteDiv.className = 'project-note';
          noteDiv.textContent = note;

          li.appendChild(nameDiv);
          li.appendChild(noteDiv);

          if (instruction !== '') {
            const instructionDiv = document.createElement('div');
            instructionDiv.className = 'project-instruction';
            instructionDiv.textContent = instruction;
            li.appendChild(instructionDiv);
          }

          li.addEventListener('click', () => {
            iframe.src = link;

            document.querySelectorAll('#project-list li').forEach(el => {
              el.classList.remove('active');
            });
            li.classList.add('active');
          });

          listElement.appendChild(li);
        }
      });
    })
    .catch(error => console.error(error));
});