BUILD_DIR=build
T3D_INST ?= ../tiny3d

include $(N64_INST)/include/n64.mk
include $(T3D_INST)/t3d.mk

N64_CFLAGS += -std=gnu11 -O2 -Wall -Wextra
N64_LDFLAGS += -lm

SRC = src/main.c
OBJS = $(SRC:%.c=$(BUILD_DIR)/%.o)

all: relic_emberwood.z64

$(BUILD_DIR)/relic_emberwood.elf: $(OBJS)

relic_emberwood.z64: N64_ROM_TITLE="Relic of Emberwood"

clean:
	rm -rf $(BUILD_DIR) relic_emberwood.z64

-include $(wildcard $(BUILD_DIR)/src/*.d)

.PHONY: all clean
