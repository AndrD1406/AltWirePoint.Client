import { Pipe, PipeTransform } from "@angular/core";
import { isVideoUrl } from "../api/file-parameter.utils";

@Pipe({
    name: 'isVideoUrl',
    standalone: true
})
export class isVideoUrlPipe implements PipeTransform {
    transform(url: string | null | undefined): boolean {
        if(!url) return false;
        return isVideoUrl(url);
    }
}