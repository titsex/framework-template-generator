import { render } from 'ejs'

export interface TemplateData {
    projectName: string
}

export function templateRender(content: string, data: TemplateData) {
    return render(content, data)
}
