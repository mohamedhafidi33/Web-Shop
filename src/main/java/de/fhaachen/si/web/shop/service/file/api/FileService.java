package de.fhaachen.si.web.shop.service.file.api;

import java.io.IOException;
import java.nio.file.Path;

public interface FileService {
	public Path downloadFile() throws IOException;

	public void importFromJson(Path csvPath) throws IOException;
}
