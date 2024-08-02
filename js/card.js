import { util } from './util.js';
import { theme } from './theme.js';
import { storage } from './storage.js';

export const card = (() => {
    const tracker = storage('tracker');

    const lists = new Map();

    const renderLoading = () => {
        // document.getElementById('comments').innerHTML = `
        // <div class="card-body bg-theme-${theme.isDarkMode('dark', 'light')} shadow p-3 mx-0 mt-0 mb-3 rounded-4">
        //     <div class="d-flex flex-wrap justify-content-between align-items-center placeholder-wave">
        //         <span class="placeholder bg-secondary col-4 rounded-3"></span>
        //         <span class="placeholder bg-secondary col-2 rounded-3"></span>
        //     </div>
        //     <hr class="text-${theme.isDarkMode('light', 'dark')} my-1">
        //     <p class="card-text placeholder-wave">
        //         <span class="placeholder bg-secondary col-6 rounded-3"></span>
        //         <span class="placeholder bg-secondary col-5 rounded-3"></span>
        //         <span class="placeholder bg-secondary col-12 rounded-3"></span>
        //     </p>
        // </div>`.repeat(pagination.getPer());
    };

    const convertMarkdownToHTML = (input) => {
        if (lists.size === 0) {
            const text = theme.isDarkMode('light', 'dark');
            const data = [
                ['*', `<strong class="text-${text}">$1</strong>`],
                ['_', `<em class="text-${text}">$1</em>`],
                ['~', `<del class="text-${text}">$1</del>`],
                ['```', `<code class="font-monospace text-${text}">$1</code>`]
            ];

            data.forEach((v) => {
                lists.set(v[0], v[1]);
            });
        }

        lists.forEach((v, k) => {
            const regex = new RegExp(`\\${k}(?=\\S)(.*?)(?<!\\s)\\${k}`, 'gs');
            input = input.replace(regex, v);
        });

        return input;
    };

    // const renderBody = (comment, is_parent) => {
    //     const text = theme.isDarkMode('light', 'dark');

    //     return `
    //     <div class="d-flex flex-wrap justify-content-between align-items-center">
    //         <p class="text-${text} text-truncate m-0 p-0" style="font-size: 0.95rem;">${renderTitle(comment, is_parent)}</p>
    //         <small class="text-${text} m-0 p-0" style="font-size: 0.75rem;">${comment.created_at}</small>
    //     </div>
    //     <hr class="text-${text} my-1">
    //     <p class="text-${text} mt-0 mb-1 mx-0 p-0" style="white-space: pre-wrap !important" id="content-${comment.uuid}">${convertMarkdownToHTML(util.escapeHtml(comment.comment))}</p>`;
    // };

    // const renderContent = (comment, is_parent) => {
    //     return `
    //     <div ${renderHeader(is_parent)} id="${comment.uuid}">
    //         ${renderBody(comment, is_parent)}
    //         ${renderTracker(comment)}
    //         ${renderButton(comment)}
    //         ${comment.comments.map((c) => renderContent(c, false)).join('')}
    //     </div>`;
    // };

    const fetchTracker = (comment) => {
        comment.comments?.map((c) => fetchTracker(c));

        if (comment.ip === undefined || comment.user_agent === undefined || comment.is_admin || tracker.has(comment.ip)) {
            return;
        }

        fetch(`https://freeipapi.com/api/json/${comment.ip}`)
            .then((res) => res.json())
            .then((res) => {
                const result = res.cityName + ' - ' + res.regionName;

                tracker.set(comment.ip, result);
                document.getElementById(`ip-${comment.uuid}`).innerHTML = `<i class="fa-solid fa-location-dot me-1"></i>${util.escapeHtml(comment.ip)} <strong>${result}</strong>`;
            })
            .catch((err) => console.error(err));
    };

    return {
        fetchTracker,
        renderLoading,
        // renderContent: (comment) => renderContent(comment, true),
        convertMarkdownToHTML
    }
})();