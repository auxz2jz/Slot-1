T3D_INST ?= $(abspath tiny3d)

all: rom

rom:
	$(MAKE) -C n64 T3D_INST=$(T3D_INST)

clean:
	$(MAKE) -C n64 clean T3D_INST=$(T3D_INST)

.PHONY: all rom clean
