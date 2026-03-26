"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateNarrationDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_narration_dto_1 = require("./create-narration.dto");
class UpdateNarrationDto extends (0, mapped_types_1.PartialType)(create_narration_dto_1.CreateNarrationDto) {
}
exports.UpdateNarrationDto = UpdateNarrationDto;
//# sourceMappingURL=update-narration.dto.js.map